import React, {useState, useEffect} from 'react'
import queryString from "query-string"
import io from "socket.io-client"
import {Link} from "react-router-dom"

import InfoBar from "../InfoBar/InfoBar"
import Input from "../Input/Input"
import Messages from "../Messages/Messages"
import TextContainer from "../TextContainer/TextContainer"

import "./Chat.css"

let socket;

export default function Chat({location}) {


    const [name,setName] = useState('')
    const [room,setRoom] = useState('')
    const [messages,setMessages] = useState([])
    const [message,setMessage] = useState('')
    const [users, setUsers] = useState('');

    const ENDPOINT = "https://chat-app-by-lamndj.herokuapp.com/";

    useEffect( () => {
        const {name,room} = queryString.parse(location.search);
        
        socket = io(ENDPOINT);

        setName(name)
        setRoom(room)

        socket.emit("join", {name,room}, (error) => {
        
            if(error) {
                const open = document.querySelector(".errorScreen");
                const close = document.querySelector(".outerContainer");
                open.classList.add("open")
                close.classList.add("close")
              }
        })

        socket.on('roomData', ({ users }) => {
            setUsers(users);
          })

        return () => {
            socket.emit("disconnect");
            socket.off();
        }

    }, [ENDPOINT, location.search])

    useEffect( () => {
        socket.on("message",(message) => {
            setMessages([...messages,message])
        })
    },[messages])

    // FUNTION FOR SENDING MESSAGES
    const sendMessage = (event) => {

        event.preventDefault();
        if(message){
            socket.emit("sendMessage",message, () => {
                setMessage("")
            })
        }
    }

    return (

        <>
        <div className="outerContainer">
                <div className="container">
                    <InfoBar room={room}/>
                    <Messages messages={messages} name={name}/>
                    <Input message={message} setMessage={setMessage} sendMessage={sendMessage}/>
                </div>
                <TextContainer users={users}/>
        </div>

        <div className="errorScreen">
            <div className="errorMessage">Username Already Taken</div>
            <Link to="/">
                <button className="errorButton">Back to Home</button>
            </Link>
        </div>
        
        </>
    )
}
