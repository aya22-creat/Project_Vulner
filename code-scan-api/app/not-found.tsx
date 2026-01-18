import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Shield className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="mt-2 text-lg text-muted-foreground">Page not found</p>
          <p className="text-sm text-muted-foreground">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <Link href="/">
          <Button>
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
