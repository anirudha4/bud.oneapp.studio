import React from 'react'
import Button from './button'
import { Download, Upload } from 'lucide-react'

type Props = {}

const AppHeader = ({ }: Props) => {
    return (
        <div className="min-h-16 sticky top-0 left-0 w-full border-b bg-background px-4 flex justify-between items-center">
            <div className=""></div>
            <div className="flex items-center gap-3">
                <Button>
                    <Download  size={16} />
                    Export
                </Button>
                <Button>
                    <Upload size={16} />
                    Import
                </Button>
            </div>
        </div>
    )
}

export default AppHeader