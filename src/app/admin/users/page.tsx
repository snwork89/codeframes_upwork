import { checkAdminAccess } from "@/lib/admin-middleware"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, UserPlus } from "lucide-react"
import Link from "next/link"
import type { Database } from "@/lib/database.types"

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: { page?: string; search?: string }
}) {
  // This will redirect if not an admin
  const user = await checkAdminAccess()

  const supabase = createServerComponentClient<Database>({ cookies })

  const page = Number.parseInt(searchParams.page || "1")
  const pageSize = 10
  const search = searchParams.search || ""

  // Build query
  let query = supabase
    .from("profiles")
    .select("*, subscriptions(plan_type, snippet_limit)")
    .order("created_at", { ascending: false })

  // Apply search if provided
  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  // Get total count for pagination
  const { count } = await query.select("id", { count: "exact", head: true })

  // Get paginated results
  const { data: users, error } = await query.range((page - 1) * pageSize, page * pageSize - 1)

  const totalPages = Math.ceil((count || 0) / pageSize)

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all users</CardDescription>
          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <form>
                <Input
                  type="search"
                  placeholder="Search by email or name..."
                  className="pl-8"
                  name="search"
                  defaultValue={search}
                />
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Joined</th>
                  <th className="text-left py-3 px-4">Plan</th>
                  <th className="text-left py-3 px-4">Snippet Limit</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-3 px-4">{user.full_name || "N/A"}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4 capitalize">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">{formatDate(user.created_at)}</td>
                    <td className="py-3 px-4 capitalize">{(user.subscriptions as any)?.plan_type || "N/A"}</td>
                    <td className="py-3 px-4">{(user.subscriptions as any)?.snippet_limit || "N/A"}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link href={`/admin/users/${user.id}`} className="text-blue-500 hover:underline">
                          View
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link href={`/admin/users/${user.id}/edit`} className="text-blue-500 hover:underline">
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!users || users.length === 0) && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, count || 0)} of {count} entries
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} asChild>
                  <Link href={`/admin/users?page=${page - 1}${search ? `&search=${search}` : ""}`}>Previous</Link>
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} asChild>
                  <Link href={`/admin/users?page=${page + 1}${search ? `&search=${search}` : ""}`}>Next</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
