import { Stomp } from '@stomp/stompjs';
import React from 'react'
import SockJS from 'sockjs-client';
import Cookies from "js-cookie";
const Test = () => {
    const token = Cookies.get("token")
    const socket = new SockJS('http://localhost:8081/ws');
    const stompClient = Stomp.over(socket);
    
    return (
        <div>Test</div>
    )
}

export default Test