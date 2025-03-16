"use client";
import React, { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signIn } from "../../actions/auth";

async function signInAction(
    prevState: { error: string } | null,
    formData: FormData
) {
    return await signIn(prevState, formData);
}

export default function LoginPage() {
    const [state, formAction] = useActionState(signInAction, null);
    const [email, setEmail] = useState("");

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "admin") {
            setEmail("admin@siteadmin.com");
        } else {
            setEmail(value);
        }
    };
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
            <form
                action={formAction}
                className="p-8 border-2 border-muted/80 rounded-xl shadow-lg w-96 bg-black"
            >
                <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>

                    {/* Error State */}
                    {state?.error && (
                        <p className="text-red-700 bg-red-200 p-2 rounded-md text-center">
                            {state.error}
                        </p>
                    )}
                    <Button type="submit" className="w-full">
                        Log In
                    </Button>
                </div>
            </form>
        </div>
    );
}