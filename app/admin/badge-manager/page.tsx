"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import QRCode from 'react-qr-code';

function BadgeManager() {
    const [badges, setBadges] = useState<any[]>([]);
    const [showQRCode, setShowQRCode] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const fetchBadges = async () => {
            const { data, error } = await supabase.from('badges').select('*');
            if (error) console.error('Error fetching badges:', error);
            else setBadges(data || []);
        };
        fetchBadges();
    }, []);

    const addBadge = async (badge: any) => {
        const { data, error } = await supabase.from('badges').insert([badge]);
        if (error) {
            console.error('Error adding badge:', error);
        } else {
            setBadges([...badges, data ? data[0] : null]);
        }
    };

    const updateBadge = async (badgeId: any, updatedBadge: any) => {
        // ... 배지 수정 로직 ...
    };

    const deleteBadge = async (badgeId: any) => {
        const { error } = await supabase.from('badges').delete().eq('id', badgeId);
        if (error) {
            console.error('Error deleting badge:', error);
        } else {
            setBadges(badges.filter(badge => badge.id !== badgeId));
        }
    };

    const toggleQRCode = (badgeId: any) => {
        setShowQRCode(prevState => ({
            ...prevState,
            [badgeId]: !prevState[badgeId]
        }));
    };

    const generateQRCode = (badgeId: any) => {
        const url = `https://ourjdd.com/badge-obtain?badgeId=${badgeId}`;
        return <QRCode value={url} />;
    };

    const groupedBadges = badges.reduce((acc: any, badge: any) => {
        const month = new Date(badge.created_at).toLocaleString('default', { month: 'long' });
        if (!acc[month]) acc[month] = [];
        acc[month].push(badge);
        return acc;
    }, {});

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9' }}>
            <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Badge Manager</h1>
            {Object.keys(groupedBadges).sort().map(month => (
                <div key={month} style={{ marginBottom: '30px' }}>
                    <h2 style={{ textAlign: 'center', color: '#555', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>{month}</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {groupedBadges[month].sort((a: any, b: any) => a.name.localeCompare(b.name)).map((badge: any) => (
                            <div key={badge.id} style={{ border: '1px solid #ddd', borderRadius: '8px', margin: '10px', padding: '15px', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                                <img src={badge.image_url} alt={badge.name} style={{ width: '100px', height: '100px', borderRadius: '50%', display: 'block', margin: '0 auto' }} />
                                <h3 style={{ color: '#333', margin: '10px 0' }}>{badge.name}</h3>
                                <button onClick={() => toggleQRCode(badge.id)} style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', marginBottom: '10px' }}>Generate QR Code</button>
                                {showQRCode[badge.id] && generateQRCode(badge.id)}
                                <div>
                                    <button onClick={() => updateBadge(badge.id, badge)} style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', marginRight: '5px' }}>Edit</button>
                                    <button onClick={() => deleteBadge(badge.id)} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <button onClick={() => addBadge({ name: 'New Badge' })} style={{ display: 'block', margin: '20px auto', backgroundColor: '#17a2b8', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Add Badge</button>
        </div>
    );
}

export default BadgeManager;
