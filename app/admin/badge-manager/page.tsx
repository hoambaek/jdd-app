"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import QRCode from 'react-qr-code';
import { toCanvas } from 'qrcode';
import BottomNav from '../../components/BottomNav';

function BadgeManager() {
    const [badges, setBadges] = useState<any[]>([]);
    const [showQRCode, setShowQRCode] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const fetchBadges = async () => {
            const { data, error } = await supabase
                .from('badges')
                .select('*')
                .order('name');

            if (error) {
                console.error('Error fetching badges:', error);
                return;
            }

            if (data) {
                setBadges(data);
                
                const initialQRState: { [key: string]: boolean } = {};
                data.forEach(badge => {
                    if (badge.qr_code_url) {
                        initialQRState[badge.id] = true;
                    }
                });
                setShowQRCode(initialQRState);
            }
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

    const deleteBadge = async (badgeId: string) => {
        const { error } = await supabase
            .from('badges')
            .delete()
            .eq('id', badgeId);

        if (error) {
            console.error('Error deleting badge:', error);
        } else {
            setBadges(badges.filter(badge => badge.id !== badgeId));
        }
    };

    const toggleQRCode = async (badgeId: string) => {
        const currentBadge = badges.find(badge => badge.id === badgeId);
        const isCurrentlyShown = showQRCode[badgeId];

        if (!isCurrentlyShown) {
            const qrCodeURL = generateUserQRCodeURL(badgeId);
            
            const { data, error } = await supabase
                .from('badges')
                .update({ qr_code_url: qrCodeURL })
                .eq('id', badgeId)
                .select();

            if (error) {
                console.error('Error saving QR code:', error);
                return;
            }

            setBadges(badges.map(badge => 
                badge.id === badgeId 
                    ? { ...badge, qr_code_url: qrCodeURL }
                    : badge
            ));
        }

        setShowQRCode(prevState => ({
            ...prevState,
            [badgeId]: !prevState[badgeId]
        }));
    };

    const getUserIdentifier = () => {
        // 예시: 사용자 ID를 반환
        // 실제 구현에서는 인증된 사용자 정보를 가져와야 합니다.
        return 'user123';
    };

    const claimBadge = async (badgeId: string) => {
        // 이 함수는 더 이상 필요하지 않습니다.
    };

    const groupBadgesByMonth = (badges: any[]) => {
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        const groupedBadges: { [key: number]: any[] } = {};
        
        months.forEach(month => {
            const monthBadges = badges.filter(badge => {
                const monthNumber = parseInt(badge.name.split('-')[0]);
                return monthNumber === month;
            });
            groupedBadges[month] = monthBadges;
        });
        
        return groupedBadges;
    };
    const generateQRCode = (badgeId: string) => {
        const qrCodeURL = badges.find(badge => badge.id === badgeId)?.qr_code_url;
        if (!qrCodeURL) return null;
    
        return (
            <QRCode
                value={qrCodeURL}
                size={128}
                style={{ margin: '0 auto' }}
            />
        );
    };
    const deleteQRCode = async (badgeId: string) => {
        const { data, error } = await supabase
            .from('badges')
            .update({ qr_code_url: null })
            .eq('id', badgeId)
            .select();

        if (error) {
            console.error('Error deleting QR code:', error);
            return;
        }

        setShowQRCode(prevState => ({
            ...prevState,
            [badgeId]: false
        }));

        setBadges(badges.map(badge => 
            badge.id === badgeId 
                ? { ...badge, qr_code_url: null }
                : badge
        ));
    };

    const downloadQRCode = async (badgeId: string) => {
        const badge = badges.find(b => b.id === badgeId);
        const qrCodeURL = badge?.qr_code_url || generateUserQRCodeURL(badgeId);
        
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        
        try {
            await toCanvas(canvas, qrCodeURL, {
                width: 1024,
                margin: 4,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `qrcode-${badgeId}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    }; // 여기에서 함수가 닫혀야 함.

    const generateUserQRCodeURL = (badgeId: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        return `${baseUrl}/claim/${badgeId}`;
    };

    return (
        <div style={{ 
            padding: '20px', 
            fontFamily: 'Arial, sans-serif', 
            backgroundColor: '#f0f2f5',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <h1 style={{ 
                textAlign: 'center', 
                color: '#fff', 
                marginBottom: '20px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}>Badge Manager</h1>
            {Object.entries(groupBadgesByMonth(badges)).map(([month, monthBadges]) => (
                <div key={month} style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
                    margin: '20px 0',
                    padding: '20px',
                    overflow: 'hidden'
                }}>
                    <h2 style={{ 
                        color: '#fff', 
                        marginBottom: '15px',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                    }}>{month}월</h2>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                        {monthBadges.sort((a: any, b: any) => {
                            const aNum = parseInt(a.name.split('-')[1]);
                            const bNum = parseInt(b.name.split('-')[1]);
                            return aNum - bNum;
                        }).map((badge: any) => (
                            <div key={badge.id} style={{ 
                                background: badge.name.startsWith('1-') 
                                    ? 'rgba(255, 255, 255, 0.05)'  // 1-X 배지는 더 투명하게
                                    : 'rgba(255, 255, 255, 0.25)', // 나머지 배지는 기존대로
                                backdropFilter: 'blur(4px)',
                                WebkitBackdropFilter: 'blur(4px)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.18)',
                                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                                padding: '15px',
                                textAlign: 'center',
                                width: 'calc(33.33% - 20px)',
                                minWidth: '280px',
                                maxWidth: '320px',
                                transition: 'transform 0.3s ease',
                                cursor: 'pointer'
                            }}>
                                <img src={badge.image_url} alt={badge.name} style={{ 
                                    width: '80px',
                                    height: '80px',
                                    display: 'block', 
                                    margin: '0 auto'
                                }} />
                                <h3 style={{ 
                                    color: '#fff', 
                                    margin: '8px 0',
                                    fontSize: '16px',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                                }}>{badge.name}</h3>
                                <button onClick={() => toggleQRCode(badge.id)} style={{ 
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    marginBottom: '8px',
                                    transition: 'all 0.3s ease',
                                    fontSize: '14px'
                                }}>
                                    QR생성
                                </button>
                                {showQRCode[badge.id] && (
                                    <>
                                        {generateQRCode(badge.id)}
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'center', 
                                            gap: '8px',
                                            alignItems: 'center'
                                        }}>
                                            <button 
                                                onClick={() => downloadQRCode(badge.id)} 
                                                style={{ 
                                                    background: 'rgba(25, 135, 84, 0.3)',
                                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                                    padding: '6px 10px',
                                                    borderRadius: '6px',
                                                    color: '#fff',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Down
                                            </button>
                                            <button 
                                                onClick={() => deleteQRCode(badge.id)} 
                                                style={{ 
                                                    background: 'rgba(220, 53, 69, 0.3)',
                                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                                    padding: '6px 10px',
                                                    borderRadius: '6px',
                                                    color: '#fff',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <BottomNav />
        </div>
    );
}

export default BadgeManager;