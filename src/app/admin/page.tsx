import { checkAdminAccess } from "@/lib/admin-middleware"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Code, DollarSign } from "lucide-react"
import Link from "next/link"
import type { Database } from "@/lib/database.types"

export default async function AdminDashboard() {
  // This will redirect if not an admin
  const user = await checkAdminAccess()

  const supabase = createServerComponentClient<Database>({ cookies })

  // Get counts for dashboard
  const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: snippetCount } = await supabase.from("snippets").select("*", { count: "exact", head: true })

  const { count: invoiceCount } = await supabase.from("invoices").select("*", { count: "exact", head: true })

  // Get total revenue
  const { data: revenueData } = await supabase.from("invoices").select("amount").eq("status", "completed")

  const totalRevenue = revenueData?.reduce((sum, invoice) => sum + invoice.amount, 0) || 0

  // Get recent invoices
  const { data: recentInvoices } = await supabase
    .from("invoices")
    .select("*, profiles(email, full_name)")
    .order("created_at", { ascending: false })
    .limit(5)

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
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/admin/users" className="text-blue-500 hover:underline">
                View all users
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Snippets</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{snippetCount}</div>
            <p className="text-xs text-muted-foreground">Code snippets created by users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoiceCount}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/admin/invoices" className="text-blue-500 hover:underline">
                View all invoices
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From all completed payments</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mb-4">Recent Invoices</h2>
      <Card>
        <CardHeader>
          <CardTitle>Latest Transactions</CardTitle>
          <CardDescription>Recent payment activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Plan</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices?.map((invoice) => (
                  <tr key={invoice.id} className="border-b">
                    <td className="py-3 px-4">{formatDate(invoice.created_at)}</td>
                    <td className="py-3 px-4">
                      {(invoice.profiles as any)?.full_name || (invoice.profiles as any)?.email || "Unknown"}
                    </td>
                    <td className="py-3 px-4 capitalize">{invoice.plan_type}</td>
                    <td className="py-3 px-4">${invoice.amount.toFixed(2)}</td>
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
                  </tr>
                ))}
                {(!recentInvoices || recentInvoices.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <Link href="/admin/invoices" className="text-sm text-blue-500 hover:underline">
              View all invoices
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
