

// import { ICellRendererParams } from 'ag-grid-community';
// import React, { useEffect, useRef } from 'react'
// import { EventType } from '../EventTable';
// import { api } from '../../../config/api';
// import { AxiosError } from 'axios';
// import { useEvent } from '../../../context/EventContext';

// export const AssignOrganizer:React.FC<{
//     params: ICellRendererParams<EventType>;
//   }> = ({ params }) => {
//     const { refreshEvents} = useEvent()
//     const assignModalRef = useRef<HTMLDialogElement>(null);
//     const [selectedUserUtorId, setSelectedUserUtorId] = React.useState<string | null>(null);

//     const handleOpenAssignModal = () => {
//       if (assignModalRef.current) {
//         assignModalRef.current.showModal();
//       }
//     };
//     const handleCloseAssignModal = () => {
//       if (assignModalRef.current) {
//         assignModalRef.current.close();
//       }
//     }

//     const handleAssignOrganizer = async () => {
//       if (!selectedUserUtorId || !params.data?.id) return;
//       try {
//         const response = await api.post(`/events/${params.data.id}/organizers`, {
//           user: selectedUserUtorId,
//         });
//         if (response.status === 200) {
//           refreshEvents();
//           handleCloseAssignModal();
//         }
//       } catch (error) { 
//         if (error instanceof AxiosError) {
//           console.error('Error assigning organizer:', error.message);
//         } else {
//           console.error('Unexpected error:', error);
//         }
//       }
//     }

//     if (
//         params.data &&
//         !params.data.published
//       ) {
//         return (
//           <>
//           <button
//             className="btn btn-xs"
//             onClick={() => handleOpenAssignModal()}
//           >
//              Add Organizer
//           </button>
//           {/* Open the modal using document.getElementById('ID').showModal() method */}
//           <dialog ref={assignModalRef} className="modal">
//             <div className="modal-box">
//               <h3 className="font-bold text-lg">Assign new organizer for {params.data.name}</h3>
//               <p className="py-4">
//                   <select defaultValue="Select a user" className="select" onChange={(e) => {
//                     setSelectedUserUtorId(e.target.value);
//                   }}>
//                       <option disabled={true}>Select a user</option>
//                 {allUsers.map((user) => (
//                   <option key={user.id} value={user.utorid} onSelect={
//                     () => {
//                       setSelectedUserUtorId(user.utorid);
//                     }
//                   }>{user.name}</option>
//                 ))}
//                 </select>
//               </p>
//               <div className="modal-action">
//                 <form method="dialog">
//                   {/* if there is a button in form, it will close the modal */}
//                   <button className="btn">Yes</button>
//                   <button className="btn" onClick={handleCloseAssignModal} >No</button>
//                 </form>
//               </div>
//             </div>
//           </dialog>
    
//           </>
//         );
//       }
// }
