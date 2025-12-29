// firstcare-frontend/app/(route)/auth/signUp/page.js
// Ensures the component runs on the client side
"use client";

import React from "react";
import Auth from "../auth";

export default function SignUpPage() {
    return <Auth initialMode="signUp" />;
}