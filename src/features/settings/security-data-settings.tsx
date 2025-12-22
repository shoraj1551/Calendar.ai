"use client";

import { useState } from "react";
import { Shield, Smartphone, Globe, Download, Trash, Database, Key, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SecurityDataSettings() {
    const [sessions, setSessions] = useState([
        { id: 1, device: 'MacBook Pro', location: 'San Francisco, US', active: true, ip: '192.168.1.1', lastActive: 'Now' },
        { id: 2, device: 'iPhone 15 Pro', location: 'San Francisco, US', active: false, ip: '192.168.1.45', lastActive: '2h ago' },
    ]);

    const revokeSession = (id: number) => {
        setSessions(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div className="space-y-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                Security, Data & Transparency
            </h3>

            <div className="space-y-6">

                {/* Active Sessions */}
                <div className="space-y-4">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Key className="w-4 h-4 text-gray-500" />
                        Active Sessions
                    </h4>
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                        {sessions.map(session => (
                            <div key={session.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                                        {session.device.toLowerCase().includes('phone') ? <Smartphone className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">{session.device}</h5>
                                            {session.active && <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Current</Badge>}
                                        </div>
                                        <p className="text-xs text-gray-500">{session.location} • {session.ip} • Active {session.lastActive}</p>
                                    </div>
                                </div>
                                {!session.active && (
                                    <Button variant="ghost" size="sm" onClick={() => revokeSession(session.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Revoke
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Data Usage */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Database className="w-4 h-4 text-blue-500" />
                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Data Footprint</h4>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Calendar Events</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">1,240</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Learned Preferences</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">48</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Stored Recordings</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">3 (44MB)</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                            Your data is stored locally first, then encrypted in the cloud. We do not sell your data.
                        </p>
                    </div>

                    {/* Data Actions */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 space-y-4 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4 text-gray-500" />
                                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Your Right to Data</h4>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">
                                You own your data. Download a copy or delete it permanently at any time.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button variant="outline" className="w-full justify-start">
                                <Download className="w-4 h-4 mr-2 text-gray-500" />
                                Export All Data (JSON)
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 border-red-100 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10">
                                <Trash className="w-4 h-4 mr-2" />
                                Delete Account & Data
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
