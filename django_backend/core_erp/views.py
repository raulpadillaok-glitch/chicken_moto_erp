from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, F
from django.utils import timezone
from workshop.models import RepairOrder, Quote
from inventory.models import Product
from accounts.models import Client
from django.db.models import Q
import re

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. Reparaciones activas (todo lo que no esté terminado o entregado)
        active_repairs = RepairOrder.objects.exclude(status__in=['finished', 'delivered']).count()
        
        # 2. Productos en Stock total (suma del stock de todos los productos)
        total_stock_agg = Product.objects.aggregate(Sum('stock'))
        total_stock = total_stock_agg['stock__sum'] or 0

        # 3. Alertas de stock (cuántos productos están en o por debajo de su margen)
        low_stock_alerts = Product.objects.filter(stock__lte=F('min_stock')).count()

        # 4. Ingresos del mes (sumatoria de cotizaciones aprobadas este mes)
        current_month = timezone.now().month
        current_year = timezone.now().year
        income_agg = Quote.objects.filter(
            status='approved',
            issue_date__month=current_month,
            issue_date__year=current_year
        ).aggregate(Sum('total'))
        monthly_income = income_agg['total__sum'] or 0

        return Response({
            "active_repairs": active_repairs,
            "total_stock": total_stock,
            "low_stock_alerts": low_stock_alerts,
            "monthly_income": monthly_income
        })

class ChatbotQueryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        query = request.data.get('query', '').lower().strip()
        if not query:
            return Response({"reply": "Por favor, escribe una pregunta."})

        # 1. Intent: Inventory (Stock)
        if any(word in query for word in ["stock", "cuantos", "quedan", "hay", "precio", "cuesta"]):
            # Extraer posible nombre del producto (palabras que no sean stop words básicas)
            words = query.split()
            keywords = [w for w in words if w not in ["cuantos", "quedar", "hay", "de", "el", "la", "los", "las", "un", "una", "precio", "cuesta", "stock", "cuanto", "?", "¿"]]
            if keywords:
                search_term = " ".join(keywords)
                # Buscar en productos
                products = Product.objects.filter(Q(name__icontains=search_term) | Q(sku__icontains=search_term))
                if products.exists():
                    responses = []
                    for p in products[:3]:
                        responses.append(f"📦 {p.name} (SKU: {p.sku}): Hay {p.stock} unidades en stock. Precio: Bs. {p.sale_price}.")
                    return Response({"reply": "Esto es lo que encontré en el inventario:\\n" + "\\n".join(responses)})
                else:
                    return Response({"reply": f"No encontré ningún repuesto o producto que coincida con '{search_term}'."})
            return Response({"reply": "Para consultar inventario, dime el nombre del producto, por ejemplo: '¿cuánto stock hay de filtro?'"})

        # 2. Intent: Orders
        if any(word in query for word in ["orden", "estado", "reparacion", "moto", "placa"]):
            words = query.split()
            keywords = [w for w in words if w not in ["orden", "estado", "reparacion", "moto", "placa", "de", "la", "el", "¿", "?"]]
            if keywords:
                search_term = keywords[-1].upper() # Try to get order code or plate
                orders = RepairOrder.objects.filter(Q(code__icontains=search_term) | Q(motorcycle__plate__icontains=search_term))
                if orders.exists():
                    order = orders.first()
                    return Response({"reply": f"🔧 Orden {order.code} (Moto {order.motorcycle}): Su estado actual es '{order.get_status_display()}'. Ingresó el {order.entry_at.strftime('%d/%m/%Y')}."})
            return Response({"reply": "Para ver el estado de una reparación, dime el código de la orden o la placa. (Ej: 'estado de la orden ORD-1234')"})
        
        # 3. Intent: Clients
        if any(word in query for word in ["cliente", "telefono", "numero", "contacto"]):
            words = query.split()
            keywords = [w for w in words if len(w) > 3 and w not in ["cliente", "telefono", "numero", "contacto", "cual", "es", "el", "del"]]
            if keywords:
                search_term = keywords[0]
                clients = Client.objects.filter(person__first_name__icontains=search_term) | Client.objects.filter(person__last_name__icontains=search_term)
                if clients.exists():
                    c = clients.first()
                    return Response({"reply": f"👤 Cliente {c.person.first_name} {c.person.last_name}: Su teléfono es {c.person.phone or 'Desconocido'}. Puntos: {c.loyalty_points}."})
            return Response({"reply": "Para buscar un cliente, usa su nombre. Ej: 'telefono del cliente Juan'"})

        # 4. Smart/Global Queries (Quick Replies)
        if query == "stock bajo" or "alertas de stock" in query:
            low_products = Product.objects.filter(stock__lte=F('min_stock'))
            if not low_products.exists():
                return Response({"reply": "✅ **¡Buenas noticias!** Ningún repuesto está por debajo de su margen de seguridad."})
            
            lines = ["⚠️ **Alerta de Stock Crítico:**", ""]
            for p in low_products[:5]:
                lines.append(f"• **{p.name}** (Quedan {p.stock} u.)")
            if low_products.count() > 5:
                lines.append(f"...y {low_products.count() - 5} productos más.")
            return Response({"reply": "\\n".join(lines)})

        if query == "ordenes activas" or "pendientes" in query:
            active_orders = RepairOrder.objects.exclude(status__in=['finished', 'delivered']).order_by('-entry_at')
            if not active_orders.exists():
                return Response({"reply": "✅ **Todo al día.** No hay reparaciones pendientes en el taller."})
            
            lines = [f"🔧 **Hay {active_orders.count()} motos en el taller:**", ""]
            for o in active_orders[:5]:
                lines.append(f"• **#{o.code}** ({o.motorcycle.plate}): {o.get_status_display()}")
            return Response({"reply": "\\n".join(lines)})

        if query == "resumen":
            active_repairs = RepairOrder.objects.exclude(status__in=['finished', 'delivered']).count()
            low_stock_alerts = Product.objects.filter(stock__lte=F('min_stock')).count()
            
            current_month = timezone.now().month
            current_year = timezone.now().year
            income_agg = Quote.objects.filter(status='approved', issue_date__month=current_month, issue_date__year=current_year).aggregate(Sum('total'))
            monthly_income = income_agg['total__sum'] or 0

            return Response({
                "reply": f"📊 **Resumen Global de Hoy:**\\n\\n🔧 **Taller:** {active_repairs} motos en reparación.\\n⚠️ **Inventario:** {low_stock_alerts} repuestos en escasez.\\n💰 **Ingresos (Mes):** Bs. {monthly_income}"
            })

        # Default fallback
        return Response({"reply": "🤖 Soy el asistente interno de tu ERP.\\n\\nPuedes probar mis nuevos **Atajos Rápidos** usando los botones de arriba, o preguntarme sobre un repuesto o cliente en concreto."})
