import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, RotateCcw, Truck, Check } from 'lucide-react';
import { fetchOrders } from '../api';


export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders()
      .then(data => setOrders(data.orders || data))
      .catch(err => console.error("Failed to load orders:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
        Your Orders
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="card skeleton" style={{ height: 200, marginBottom: 'var(--space-md)' }} />
          ))
        ) : orders.map(order => (
          <div key={order.id} className="card" style={{ overflow: 'hidden' }}>
            <div style={{
              background: 'var(--gray-50)',
              padding: 'var(--space-md)',
              borderBottom: '1px solid var(--gray-200)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-sm)',
            }}>
              <div style={{ display: 'flex', gap: 'var(--space-xl)', fontSize: 'var(--font-size-sm)' }}>
                <div>
                  <div className="text-muted">ORDER PLACED</div>
                  <div style={{ fontWeight: 500 }}>{order.orderDate}</div>
                </div>
                <div>
                  <div className="text-muted">TOTAL</div>
                  <div style={{ fontWeight: 500 }}>₹{order.price?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted">ORDER #</div>
                  <div style={{ fontWeight: 500, color: 'var(--teal-700)' }}>{order.id}</div>
                </div>
              </div>
              <div className={`badge ${order.status === 'Delivered' ? 'badge-green' : 'badge-blue'}`}>
                {order.status === 'Delivered' ? <Check size={12} /> : <Truck size={12} />}
                {order.status}
              </div>
            </div>

            <div style={{ padding: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
              <div style={{
                width: 80,
                height: 80,
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40,
                flexShrink: 0,
              }}>
                {order.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <Link to={`/product/${order.productId}`} style={{ fontWeight: 500, fontSize: 'var(--font-size-md)', color: 'var(--teal-700)' }}>
                  {order.productName}
                </Link>
                {order.deliveryDate && (
                  <div className="text-sm text-muted" style={{ marginTop: 'var(--space-xs)' }}>
                    Delivered on {order.deliveryDate}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <Link to={`/product/${order.productId}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                  <Package size={14} /> View Product
                </Link>
                {order.canReturn && (
                  <Link to={`/return/${order.id}`} className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                    <RotateCcw size={14} /> Return / Replace
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
