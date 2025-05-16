import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

function UnauthenticatedSidebar() {
  return (
    <div className="sticky top-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Welcome Back!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-4">
            Login to access your profile and connect with others
          </p>
          <SignInButton mode="modal">
            <Button variant="outline" className="w-full mb-2">
              Login
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="default" className="w-full">
              Sign Up
            </Button>
          </SignUpButton>
        </CardContent>
      </Card>
    </div>
  );
}

export default UnauthenticatedSidebar;
