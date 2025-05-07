"use client"

import { checkAdminAccess } from "@/lib/admin-middleware"
import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { redirect } from "next/navigation"
import type { Database } from "@/lib/database.types"

export default async function EditUser({
  params,
}: {
  params: { id: string }
}) {


  const supabase = createClientComponentClient()

  // Get user data
  const { data: user, error } = await supabase
    .from("profiles")
    .select("*, subscriptions(plan_type, snippet_limit, status)")
    .eq("id", params.id)
    .single()

  if (error || !user) {
    redirect("/admin/users")
  }

  async function updateUser(formData: FormData) {


    

    // Check if current user is admin
    await checkAdminAccess()

    const role = formData.get("role") as string
    const fullName = formData.get("fullName") as string
    const snippetLimit = Number.parseInt(formData.get("snippetLimit") as string)
    const planType = formData.get("planType") as string

    // Update profile
    await supabase
      .from("profiles")
      .update({
        role,
        full_name: fullName,
      })
      .eq("id", params.id)

    // Update subscription
    await supabase
      .from("subscriptions")
      .update({
        snippet_limit: snippetLimit,
        plan_type: planType,
      })
      .eq("user_id", params.id)

    redirect("/admin/users")
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit User</h1>

      <Card className="max-w-2xl">
        <form action={updateUser}>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Edit user information and permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled />
              <p className="text-sm text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" defaultValue={user.full_name || ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue={user.role}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planType">Plan Type</Label>
              <Select name="planType" defaultValue={(user.subscriptions as any)?.plan_type || "free"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="snippetLimit">Snippet Limit</Label>
              <Input
                id="snippetLimit"
                name="snippetLimit"
                type="number"
                defaultValue={(user.subscriptions as any)?.snippet_limit || 10}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => history.back()}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
