// firstcare-frontend/app/(route)/auth/signIn/page.js
// Ensures the component runs on the client side
"use client";

import React from "react";
import Auth from "../auth";

export default function SignInPage() {
  return <Auth initialMode="signIn" />;
}