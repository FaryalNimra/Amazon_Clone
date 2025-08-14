export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div 
      className="min-h-screen bg-gray-50 dashboard-container"
      style={{ 
        overflow: 'hidden', 
        msOverflowStyle: 'none'
      }}
    >
      {children}
    </div>
  )
}

