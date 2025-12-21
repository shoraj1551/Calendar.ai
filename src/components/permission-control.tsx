"use client";

import { useState } from "react";
import { Mic, MicOff, Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PermissionControl() {
    const [micEnabled, setMicEnabled] = useState(false);
    const [cameraEnabled, setCameraEnabled] = useState(false);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                    {micEnabled ? <Mic className="h-4 w-4 text-green-500" /> : <MicOff className="h-4 w-4 text-destructive" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Permissions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setMicEnabled(!micEnabled)}>
                    {micEnabled ? <Mic className="mr-2 h-4 w-4" /> : <MicOff className="mr-2 h-4 w-4" />}
                    {micEnabled ? "Disable Microphone" : "Enable Microphone"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCameraEnabled(!cameraEnabled)}>
                    {cameraEnabled ? <Camera className="mr-2 h-4 w-4" /> : <CameraOff className="mr-2 h-4 w-4" />}
                    {cameraEnabled ? "Disable Camera" : "Enable Camera"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
