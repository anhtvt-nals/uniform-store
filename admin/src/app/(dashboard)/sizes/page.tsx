"use client"

import {useState} from "react"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {apiClient, getToken} from "@/lib/api"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Dialog, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Edit, Plus, Trash2} from "lucide-react"
import {toast} from "sonner"

type Size = {id: string; code: string; weightRange: string; sortOrder: number; isActive: boolean}
type Form = Omit<Size, "id">
const blank: Form = {code: "", weightRange: "", sortOrder: 0, isActive: true}

export default function SizesPage() {
  const token = getToken(); const client = useQueryClient(); const [editing, setEditing] = useState<Size | null>(null); const [creating, setCreating] = useState(false)
  const {data: sizes = [], isLoading} = useQuery({queryKey: ["sizes"], queryFn: () => apiClient<Size[]>("/sizes", {token}).then((result) => result.data || [])})
  const refresh = () => client.invalidateQueries({queryKey: ["sizes"]})
  const close = () => {setEditing(null); setCreating(false)}
  const create = useMutation({mutationFn: (body: Form) => apiClient("/sizes", {method: "POST", token, body}), onSuccess: () => {refresh(); close(); toast.success("Đã tạo size")}})
  const update = useMutation({mutationFn: ({id, body}: {id: string; body: Form}) => apiClient(`/sizes/${id}`, {method: "PATCH", token, body}), onSuccess: () => {refresh(); close(); toast.success("Đã lưu size")}})
  const remove = useMutation({mutationFn: (id: string) => apiClient(`/sizes/${id}`, {method: "DELETE", token}), onSuccess: () => {refresh(); toast.success("Đã xóa size")}})
  const initial: Form = editing ? {code: editing.code, weightRange: editing.weightRange, sortOrder: editing.sortOrder, isActive: editing.isActive} : blank
  return <div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Kích thước</h1><p className="text-sm text-muted-foreground">Quản lý size dùng chung cho các sản phẩm, ví dụ M (40–50 Kg).</p></div><Button onClick={() => setCreating(true)}><Plus className="mr-2 size-4" />Thêm size</Button></div>
    <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Size</TableHead><TableHead>Khoảng cân nặng</TableHead><TableHead>Thứ tự</TableHead><TableHead>Trạng thái</TableHead><TableHead className="w-24">Thao tác</TableHead></TableRow></TableHeader><TableBody>{isLoading ? <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Đang tải...</TableCell></TableRow> : sizes.length === 0 ? <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Chưa có size nào.</TableCell></TableRow> : sizes.map((size) => <TableRow key={size.id}><TableCell className="font-semibold">{size.code}</TableCell><TableCell>{size.weightRange || "—"}</TableCell><TableCell>{size.sortOrder}</TableCell><TableCell className={size.isActive ? "text-green-600" : "text-muted-foreground"}>{size.isActive ? "Hiển thị" : "Ẩn"}</TableCell><TableCell><div className="flex"><Button size="icon" variant="ghost" onClick={() => setEditing(size)}><Edit className="size-4" /></Button><Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove.mutate(size.id)}><Trash2 className="size-4" /></Button></div></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
    <Dialog open={creating || !!editing} onOpenChange={(open) => !open && close()}><SizeEditor key={editing?.id || "new"} initial={initial} onCancel={close} onSave={(form) => editing ? update.mutate({id: editing.id, body: form}) : create.mutate(form)} /></Dialog>
  </div>
}

function SizeEditor({initial, onCancel, onSave}: {initial: Form; onCancel: () => void; onSave: (form: Form) => void}) {
  const [value, setValue] = useState(initial)
  return <div><DialogHeader><DialogTitle>{initial.code ? "Chỉnh sửa size" : "Thêm size"}</DialogTitle></DialogHeader><div className="space-y-4 py-5"><div><label className="mb-1 block text-sm font-medium">Tên size</label><Input value={value.code} onChange={(e) => setValue({...value, code: e.target.value})} placeholder="Ví dụ: M" /></div><div><label className="mb-1 block text-sm font-medium">Khoảng cân nặng</label><Input value={value.weightRange} onChange={(e) => setValue({...value, weightRange: e.target.value})} placeholder="Ví dụ: 40–50 Kg" /></div><div className="grid grid-cols-2 gap-4"><div><label className="mb-1 block text-sm font-medium">Thứ tự</label><Input type="number" min="0" value={value.sortOrder} onChange={(e) => setValue({...value, sortOrder: Number(e.target.value)})} /></div><label className="mt-7 flex items-center gap-2 text-sm"><input type="checkbox" checked={value.isActive} onChange={(e) => setValue({...value, isActive: e.target.checked})} /> Hiển thị</label></div></div><DialogFooter><Button variant="outline" onClick={onCancel}>Hủy</Button><Button onClick={() => value.code.trim() && onSave({...value, code: value.code.trim()})}>Lưu</Button></DialogFooter></div>
}
