import { checkAdminAccess } from "@/lib/admin-middleware"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download, Search } from "lucide-react"
import Link from "next/link"
import type { Database } from "@/lib/database.types"

export default async function AdminInvoices({
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
    .from("invoices")
    .select("*, profiles(email, full_name)")
    .order("created_at", { ascending: false })

  // Apply search if provided
  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,plan_type.ilike.%${search}%`)
  }

  // Get total count for pagination
  const { count } = await query.select("id", { count: "exact", head: true })

  // Get paginated results
  const { data: invoices, error } = await query.range((page - 1) * pageSize, page * pageSize - 1)

  const totalPages = Math.ceil((count || 0) / pageSize)

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>View and manage all invoices</CardDescription>
          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <form>
                <Input
                  type="search"
                  placeholder="Search by email, name, or plan..."
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
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Invoice ID</th>
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Plan</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Snippets Added</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices?.map((invoice) => (
                  <tr key={invoice.id} className="border-b">
                    <td className="py-3 px-4">{formatDate(invoice.created_at)}</td>
                    <td className="py-3 px-4">{invoice.id.substring(0, 8)}</td>
                    <td className="py-3 px-4">
                      {(invoice.profiles as any)?.full_name ||
                        (invoice.profiles as any)?.email ||
                        invoice.email ||
                        "Unknown"}
                    </td>
                    <td className="py-3 px-4 capitalize">{invoice.plan_type}</td>
                    <td className="py-3 px-4">${invoice.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">{invoice.snippet_limit_added}</td>
                    <td className="py-3 px-4 capitalize">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          invoice.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/invoices/${invoice.id}`} className="text-blue-500 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!invoices || invoices.length === 0) && (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-muted-foreground">
                      No invoices found
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
                  <Link href={`/admin/invoices?page=${page - 1}${search ? `&search=${search}` : ""}`}>Previous</Link>
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} asChild>
                  <Link href={`/admin/invoices?page=${page + 1}${search ? `&search=${search}` : ""}`}>Next</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
