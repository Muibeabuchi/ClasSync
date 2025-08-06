// import { useState } from 'react';
// import {
//   SidebarProvider,
//   SidebarInset,
//   SidebarTrigger,
// } from '@/components/ui/sidebar';
// import LecturerSidebar from './lecturer-sidebar';
// import { Outlet } from '@tanstack/react-router';

// interface LecturerDashboardProps {
//   userData: any;
// }

// // const LecturerDashboard = ({ userData }: LecturerDashboardProps) => {
// //   const [sidebarOpen, setSidebarOpen] = useState(false);

// //   const handleSidebarState = (value: boolean) => {
// //     setSidebarOpen(value);
// //   };

// //   return (
// //     <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
// //       <div className="min-h-screen flex w-full">
// //         <LecturerSidebar
// //           userData={userData}
// //           handleSidebarState={handleSidebarState}
// //         />
// //         <SidebarInset className="flex-1">
// //           <div className="flex items-center gap-2 px-4 py-2 border-b">
// //             <SidebarTrigger />
// //           </div>
// //           <div className="p-6">
// //             <Outlet />
// //           </div>
// //         </SidebarInset>
// //       </div>
// //     </SidebarProvider>
// //   );
// // };

// export default LecturerDashboard;
