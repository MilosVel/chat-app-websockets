//////        WebSockets 



import React, { useContext, useEffect } from "react";
import { Col, ListGroup, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import { addNotifications, resetNotifications } from "../features/userSlice";
import "./Sidebar.css";

function Sidebar() {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const { socket, setMembers, members, setCurrentRoom, setRooms, privateMemberMsg, rooms, setPrivateMemberMsg, currentRoom } = useContext(AppContext);

    function joinRoom(room, isPublic = true) {
        if (!user) {
            return alert("Please login");
        }
        socket.sendMsg("join-room", { newRoom: room, previousRoom: currentRoom });
        setCurrentRoom(room);

        if (isPublic) {
            setPrivateMemberMsg(null);
        }

        // dispatch for notifications
        dispatch(resetNotifications(room));
    }

    useEffect(() => {
        function handleMessage(event) {
            const { type, payload } = JSON.parse(event.data);

            if (type === 'new-user') {
                setMembers(payload);
            }

            if (type === 'notifications') {
                if (currentRoom !== payload) dispatch(addNotifications(payload));
            }
        }

        socket.addEventListener('message', handleMessage);
        return () => socket.removeEventListener('message', handleMessage);
    }, [currentRoom, socket]); // socket is within depenedencies

    useEffect(() => {
        if (user) {
            setCurrentRoom("general");
            getRooms();
            socket.sendMsg("join-room", { newRoom: "general", previousRoom: null });
            socket.sendMsg("new-user");
        }
    }, []);

    function getRooms() {
        fetch(`${process.env.REACT_APP_URL}/rooms`)
            .then((res) => res.json())
            .then((data) => setRooms(data));
    }

    function orderIds(id1, id2) {
        if (id1 > id2) {
            return id1 + "-" + id2;
        } else {
            return id2 + "-" + id1;
        }
    }

    function handlePrivateMemberMsg(member) {
        setPrivateMemberMsg(member);
        const roomId = orderIds(user._id, member._id);
        joinRoom(roomId, false);
    }

    if (!user) {
        return <></>;
    }
    console.log('USern new messages su,', user.newMessages)
    return (
        <>
            <h2>Available rooms</h2>
            <ListGroup>
                {rooms.map((room, idx) => (
                    <ListGroup.Item key={`room_${idx}`} onClick={() => joinRoom(room)} active={room === currentRoom} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                        {room} {<span className="badge rounded-pill bg-primary">{user.newMessages[room]}</span>}
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <h2>Members</h2>
            {members.map((member) => (
                <ListGroup.Item key={`member_${member._id}`} style={{ cursor: "pointer" }} active={privateMemberMsg?._id === member?._id} onClick={() => handlePrivateMemberMsg(member)} disabled={member._id === user._id}>
                    <Row>
                        <Col xs={2} className="member-status">
                            <img src={member.picture} className="member-status-img" />
                            {member.status === "online" ? <i className="fas fa-circle sidebar-online-status"></i> : <i className="fas fa-circle sidebar-offline-status"></i>}
                        </Col>
                        <Col xs={9}>
                            {member.name}
                            {member._id === user?._id && " (You)"}
                            {member.status === "offline" && " (Offline)"}
                        </Col>
                        <Col xs={1}>
                            <span className="badge rounded-pill bg-primary">{user.newMessages[orderIds(member._id, user._id)]}</span>
                        </Col>
                    </Row>
                </ListGroup.Item>
            ))}
        </>
    );
}

export default Sidebar;



//////// Socket.IO


// import React, { useContext, useEffect } from "react";
// import { Col, ListGroup, Row } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import { AppContext } from "../context/appContext";
// import { addNotifications, resetNotifications } from "../features/userSlice";
// import "./Sidebar.css";

// function Sidebar() {
//     const user = useSelector((state) => state.user);
//     const dispatch = useDispatch();
//     const { socket, setMembers, members, setCurrentRoom, setRooms, privateMemberMsg, rooms, setPrivateMemberMsg, currentRoom } = useContext(AppContext);

//     function joinRoom(room, isPublic = true) {
//         if (!user) {
//             return alert("Please login");
//         }
//         socket.emit("join-room", room, currentRoom);
//         setCurrentRoom(room);

//         if (isPublic) {
//             setPrivateMemberMsg(null);
//         }

//         // dispatch for notifications
//         dispatch(resetNotifications(room));
//     }

//     socket.off("notifications").on("notifications", (room) => { //  parametar room dolazi sa frontenda ovde, i ako se razlikuje od currentRoom onda se dispacuju notifikacije
//         if (currentRoom != room) dispatch(addNotifications(room));
//     });

//     useEffect(() => {
//         if (user) { // ovim useEffectom se ponovo rerenderuje komponenta, kada se user uloguje
//             setCurrentRoom("general");
//             getRooms();
//             socket.emit("join-room", "general");
//             socket.emit("new-user"); // Ovde (kao i iz Login.jsa, prilikom logovanja) se emituje 'new-user'.
//         }
//     }, []);

//     socket.off("new-user").on("new-user", (payload) => { // ovde se osluckuje kada se uloguje nov user
//         setMembers(payload); // iz Login.js (i ovde iznad iz useEffecta) se emituje 'new-user', bekend ovim vraca update listu usera.
//     });

//     function getRooms() {
//         fetch(`${process.env.REACT_APP_URL}/rooms`)
//             .then((res) => res.json())
//             .then((data) => setRooms(data));
//     }

//     function orderIds(id1, id2) { // ova funkcija osigurava da se radi o istoj sobi bez obzira da li id1 salje id2 ili id2 salje id1
//         if (id1 > id2) {
//             return id1 + "-" + id2;
//         } else {
//             return id2 + "-" + id1;
//         }
//     }

//     function handlePrivateMemberMsg(member) {
//         setPrivateMemberMsg(member);
//         const roomId = orderIds(user._id, member._id);
//         joinRoom(roomId, false);
//     }

//     if (!user) {
//         return <></>;
//     }
//     console.log('USern new messages su,', user.newMessages)
//     return (
//         <>
//             <h2>Available rooms</h2>
//             <ListGroup>
//                 {rooms.map((room, idx) => (
//                     <ListGroup.Item key={`room_${idx}` + Math.random()} onClick={() => joinRoom(room)} active={room == currentRoom} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
//                         {/* {room} {currentRoom !== room && <span className="badge rounded-pill bg-primary">{user.newMessages[room]}</span>} */}

//                         {room} {<span className="badge rounded-pill bg-primary">{user.newMessages[room]}</span>}
//                     </ListGroup.Item>
//                 ))}
//             </ListGroup>
//             <h2>Members</h2>
//             {members.map((member) => (
//                 <ListGroup.Item key={`member_${member.id}` + Math.random()} style={{ cursor: "pointer" }} active={privateMemberMsg?._id == member?._id} onClick={() => handlePrivateMemberMsg(member)} disabled={member._id === user._id}>
//                     <Row>
//                         <Col xs={2} className="member-status">
//                             <img src={member.picture} className="member-status-img" />
//                             {member.status == "online" ? <i className="fas fa-circle sidebar-online-status"></i> : <i className="fas fa-circle sidebar-offline-status"></i>}
//                         </Col>
//                         <Col xs={9}>
//                             {member.name}
//                             {member._id === user?._id && " (You)"}
//                             {member.status == "offline" && " (Offline)"}
//                         </Col>
//                         {/* Ovo ispod je kolona za privatne notifikacije */}
//                         <Col xs={1}>
//                             <span className="badge rounded-pill bg-primary">{user.newMessages[orderIds(member._id, user._id)]}</span>
//                         </Col>
//                     </Row>
//                 </ListGroup.Item>
//             ))}
//         </>
//     );
// }

// export default Sidebar;






