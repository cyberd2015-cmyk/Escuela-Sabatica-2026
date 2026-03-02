import { useEffect, useState } from 'react';

export function QRPreview() {
    const [url, setUrl] = useState('');

    useEffect(() => {
        // Lee la URL actual del panel de previsualización
        if (typeof window !== 'undefined') {
            setUrl(window.location.href);
        }
    }, []);

    if (!url) return null;

    return (
        <div className="fixed top-4 right-4 z-50 bg-white p-2 rounded-lg shadow-xl border border-gray-200 pointer-events-auto">
            <div className="text-xs font-bold text-center mb-2 text-slate-800 uppercase tracking-wider">
                Acceso Móvil
            </div>
            <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`}
                alt="QR Code"
                className="w-32 h-32 md:w-48 md:h-48 object-contain"
            />
        </div>
    );
}
