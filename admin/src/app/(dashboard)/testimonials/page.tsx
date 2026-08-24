"use client"

import {useState} from "react"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {apiClient, getToken} from "@/lib/api"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {ImageUploader} from "@/components/shared/image-uploader"
import {AssetPicker} from "@/components/shared/asset-picker"
import {Edit, Plus, Save, Trash2} from "lucide-react"
import {toast} from "sonner"

type Testimonial = {id: string; content: Record<string, string>; author: Record<string, string>; role: Record<string, string>; avatarUrl: string; rating: number; isActive: boolean; sortOrder: number}
type Form = {content: string; author: string; role: string; avatarUrl: string; rating: number; isActive: boolean; sortOrder: number}
const blank: Form = {content: "", author: "", role: "", avatarUrl: "", rating: 5, isActive: true, sortOrder: 0}

function TestimonialEditor({initial, onSave, onCancel, submitLabel}: {initial: Form; onSave: (form: Form) => void; onCancel: () => void; submitLabel: string}) {
  const [value, setValue] = useState(initial); const [assetPickerOpen, setAssetPickerOpen] = useState(false)
  return <div className="flex min-h-0 flex-1 flex-col"><div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"><textarea value={value.content} onChange={(e) => setValue({...value, content: e.target.value})} placeholder="Nội dung đánh giá" className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm" />
    <div className="grid gap-2 sm:grid-cols-2"><Input value={value.author} onChange={(e) => setValue({...value, author: e.target.value})} placeholder="Tên khách hàng" /><Input value={value.role} onChange={(e) => setValue({...value, role: e.target.value})} placeholder="Chức danh / doanh nghiệp" /></div>
    <div className="space-y-2 border-t pt-3"><div className="space-y-2"><ImageUploader onUploadComplete={(image) => setValue({...value, avatarUrl: image.url})} /><Button type="button" variant="outline" size="sm" onClick={() => setAssetPickerOpen(true)}>Chọn avatar từ assets</Button></div><AssetPicker open={assetPickerOpen} onOpenChange={setAssetPickerOpen} onSelect={(avatarUrl) => setValue({...value, avatarUrl})} />{value.avatarUrl && <img src={value.avatarUrl} alt="Avatar preview" className="h-24 w-24 rounded-full object-cover" />}</div>
    <div className="flex flex-wrap items-center gap-2"><Input type="number" min="1" max="5" value={value.rating} onChange={(e) => setValue({...value, rating: Number(e.target.value)})} className="w-20" aria-label="Số sao" /><Input type="number" min="0" value={value.sortOrder} onChange={(e) => setValue({...value, sortOrder: Number(e.target.value)})} className="w-20" aria-label="Thứ tự" /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value.isActive} onChange={(e) => setValue({...value, isActive: e.target.checked})} /> Hiển thị</label></div></div>
    <DialogFooter className="shrink-0 border-t pt-4"><Button type="button" variant="outline" onClick={onCancel}>Hủy</Button><Button onClick={() => onSave(value)} disabled={!value.content.trim() || !value.author.trim()}><Save className="mr-2 h-4 w-4" />{submitLabel}</Button></DialogFooter>
  </div>
}

export default function TestimonialsPage() {
  const token = getToken(); const queryClient = useQueryClient(); const [editing, setEditing] = useState<Testimonial | null>(null); const [creating, setCreating] = useState(false)
  const {data: testimonials = [], isLoading, error} = useQuery({queryKey: ["testimonials"], queryFn: () => apiClient<Testimonial[]>("/testimonials", {token}).then((response) => response.data)})
  const refresh = () => queryClient.invalidateQueries({queryKey: ["testimonials"]})
  const closeDialog = () => {setCreating(false); setEditing(null)}
  const create = useMutation({mutationFn: (body: Form) => apiClient("/testimonials", {method: "POST", token, body}), onSuccess: () => {refresh(); closeDialog(); toast.success("Đã tạo đánh giá")}})
  const update = useMutation({mutationFn: ({id, body}: {id: string; body: Form}) => apiClient(`/testimonials/${id}`, {method: "PATCH", token, body}), onSuccess: () => {refresh(); closeDialog(); toast.success("Đã lưu đánh giá")}})
  const remove = useMutation({mutationFn: (id: string) => apiClient(`/testimonials/${id}`, {method: "DELETE", token}), onSuccess: () => {refresh(); toast.success("Đã xóa đánh giá")}})
  const form = editing ? {content: editing.content.vi || "", author: editing.author.vi || "", role: editing.role.vi || "", avatarUrl: editing.avatarUrl, rating: editing.rating, isActive: editing.isActive, sortOrder: editing.sortOrder} : blank

  return <div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Khách hàng đánh giá</h1><p className="text-sm text-muted-foreground">Quản lý đánh giá hiển thị trên trang chủ.</p></div><Button onClick={() => setCreating(true)}><Plus className="mr-2 h-4 w-4" />Thêm đánh giá</Button></div>
    <Card><CardContent className="p-0">{isLoading ? <p className="p-6 text-sm text-muted-foreground">Đang tải...</p> : error ? <p className="p-6 text-sm text-destructive">Không thể tải đánh giá.</p> : testimonials.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">Chưa có đánh giá. Bấm “Thêm đánh giá” để tạo mới.</p> : <Table><TableHeader><TableRow><TableHead>Avatar</TableHead><TableHead>Khách hàng</TableHead><TableHead className="hidden md:table-cell">Nội dung</TableHead><TableHead>Sao</TableHead><TableHead>Thứ tự</TableHead><TableHead>Trạng thái</TableHead><TableHead className="w-24">Thao tác</TableHead></TableRow></TableHeader><TableBody>{testimonials.map((item) => <TableRow key={item.id}><TableCell>{item.avatarUrl ? <img src={item.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" /> : "—"}</TableCell><TableCell><div className="font-medium">{item.author.vi || "—"}</div><div className="text-xs text-muted-foreground">{item.role.vi || "—"}</div></TableCell><TableCell className="hidden max-w-sm truncate text-muted-foreground md:table-cell">{item.content.vi || "—"}</TableCell><TableCell>{item.rating}/5</TableCell><TableCell>{item.sortOrder}</TableCell><TableCell><span className={item.isActive ? "text-green-600" : "text-muted-foreground"}>{item.isActive ? "Hiển thị" : "Ẩn"}</span></TableCell><TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => setEditing(item)} aria-label="Chỉnh sửa đánh giá"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove.mutate(item.id)} aria-label="Xóa đánh giá"><Trash2 className="h-4 w-4" /></Button></div></TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card>
    <Dialog open={creating || !!editing} onOpenChange={(open) => !open && closeDialog()}><div className="flex min-h-[500px] max-h-[calc(90vh-3rem)] flex-col"><DialogHeader className="shrink-0"><DialogTitle>{editing ? "Chỉnh sửa đánh giá" : "Thêm đánh giá"}</DialogTitle><DialogDescription>Nhập nội dung đánh giá và chọn avatar khách hàng.</DialogDescription></DialogHeader><TestimonialEditor key={editing?.id ?? "new"} initial={form} onCancel={closeDialog} onSave={(value) => editing ? update.mutate({id: editing.id, body: value}) : create.mutate(value)} submitLabel={editing ? "Lưu thay đổi" : "Tạo đánh giá"} /></div></Dialog>
  </div>
}
