import React, { useState } from 'react'
import ChatterChatsSection from '../../../components/ChatterChatsSection'
import UserChatsSection from '../../../components/UserChatsSection'
import { useAuthContext } from '../../../contexts/AuthContext'
import { MessageSquare } from 'lucide-react'
import ChatWindow from '../../../components/ChatWindow'

export default function Chats({ socket }) {
    const { user } = useAuthContext()
    const [selectedChatter, setSelectedChatter] = useState(null)

    const handleSelectChatter = (chatter) => {
        setSelectedChatter(chatter)
    }

    return (
        <div className='flex w-full h-screen bg-[var(--light)]/50'>
            {
                user.role === "chatter" ?
                    <ChatterChatsSection handleSelectChatter={handleSelectChatter} socket={socket} /> :
                    <UserChatsSection handleSelectChatter={handleSelectChatter} socket={socket} />
            }
            <div className='flex-1'>
                {selectedChatter ? (
                    <ChatWindow user={user} selectedChatter={selectedChatter} socket={socket} />
                ) : (
                    <div className='flex flex-col justify-center items-center w-full h-full'>
                        <MessageSquare size={60} className='text-[var(--hard)]' />
                        <h1 className='text-xl text-[var(--hard)] mt-4'>Chat with anyone</h1>
                        <p className='mt-2 text-gray-600'>Select a user and start chat with that</p>
                    </div>
                )}
            </div>
        </div>
    )
}