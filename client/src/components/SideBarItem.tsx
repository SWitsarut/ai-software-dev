import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material"
import { ReactElement } from "react"
import { NavigateFunction } from "react-router-dom"

interface ItemProp {
    name: string,
    icon: ReactElement,
    navigate: NavigateFunction,
    path: string,
    isActive: boolean
}

function SideBarItem({ name, icon, navigate, path, isActive }: ItemProp) {
    return (
        <ListItemButton
            sx={{
                width: '100%',
                height: '2.5em',
                backgroundColor: isActive ? (theme) => theme.palette.primary.dark : null
            }}
            onClick={() => { navigate(path) }}
        >
            <ListItemIcon >
                {icon}
            </ListItemIcon>
            <ListItemText primary={name} />
        </ListItemButton>
    )
}
export default SideBarItem
