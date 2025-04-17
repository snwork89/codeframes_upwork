import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Mail, ArrowLeft } from "lucide-react"

export default function SignUpConfirmation() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to home
      </Link>

      <div className="flex items-center mb-8">
        <Code className="h-6 w-6 text-purple-600 mr-2" />
        <span className="text-xl font-bold">SnippetVault</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-purple-100">
              <Mail className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Check your email</CardTitle>
          <CardDescription className="text-center">
            We've sent you a confirmation link to verify your account
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-gray-500">
          <p>Please check your email inbox and click on the verification link to complete your registration.</p>
          <p className="mt-2">If you don't see the email, check your spam folder.</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Go to login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
