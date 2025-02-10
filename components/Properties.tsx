import React from "react"
import type { Node } from "reactflow"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface PropertiesProps {
  node: Node | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, data: any) => void
}

export function Properties({ node, isOpen, onClose, onSave }: PropertiesProps) {
  const [formData, setFormData] = React.useState<any>({})

  React.useEffect(() => {
    if (node) {
      setFormData(node.data)
    }
  }, [node])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (node) {
      onSave(node.id, formData)
    }
    onClose()
  }

  if (!node) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {node.data.label} Properties</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="label">Label</Label>
            <Input id="label" name="label" value={formData.label || ""} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Input id="type" name="type" value={formData.type || ""} onChange={handleChange} disabled />
          </div>
          {/* Add more fields as needed based on the node type */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

