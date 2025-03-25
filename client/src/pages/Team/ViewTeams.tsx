import React from 'react'
import { useAuth } from '../../hooks/useAuth'

function ViewTeams() {
    const { user } = useAuth()
    
    console.log(user)
    return (
        <div>ViewTeams
            <div>{user?.id}</div>
        </div>
    )
}

export default ViewTeams