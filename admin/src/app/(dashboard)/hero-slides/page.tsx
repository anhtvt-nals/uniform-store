"use client"

import {useState} from "react"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {apiClient, getToken} from "@/lib/api"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {ImageUploader} from "@/components/shared/image-uploader"
import {Plus, Save, Trash2} from "lucide-react"
import {toast} from "sonner"

type Slide = {id: string; title: Record<string, string>; subtitle: Record<string, string>; imageUrl: string; isActive: boolean; sortOrder: number}
type Form = {title: string; content: string; imageUrl: string; sortOrder: number; isActive: boolean}
const blank: Form = {title: "", content: "", imageUrl: "", sortOrder: 0, isActive: true}

export default function HeroSlidesPage() {
  const token = getToken(); const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false); const [form, setForm] = useState<Form>(blank)
  const {data: slides = [], isLoading} = useQuery({queryKey: ["hero-slides"], queryFn: () => apiClient<Slide[]>("/banners", {token}).then((r) => r.data)})
  const refresh = () => queryClient.invalidateQueries({queryKey: ["hero-slides"]})
  const create = useMutation({mutationFn: (body: Form) => apiClient("/banners", {method: "POST", body: {title: {vi: body.title}, subtitle: {vi: body.content}, imageUrl: body.imageUrl, sortOrder: body.sortOrder, isActive: body.isActive}, token}), onSuccess: () => {refresh(); setCreating(false); setForm(blank); toast.success("Đã tạo slide")}})
  const update = useMutation({mutationFn: ({id, body}: {id: string; body: Form}) => apiClient(`/banners/${id}`, {method: "PATCH", body: {title: {vi: body.title}, subtitle: {vi: body.content}, imageUrl: body.imageUrl, sortOrder: body.sortOrder, isActive: body.isActive}, token}), onSuccess: () => {refresh(); toast.success("Đã lưu slide")}})
  const remove = useMutation({mutationFn: (id: string) => apiClient(`/banners/${id}`, {method: "DELETE", token}), onSuccess: () => {refresh(); toast.success("Đã xóa slide")}})

  const Editor = ({initial, onSave, submitLabel}: {initial: Form; onSave: (value: Form) => void; submitLabel: string}) => {
    const [value, setValue] = useState(initial)
    return <div className="grid gap-3 md:grid-cols-[160px_1fr]">
      <div className="space-y-2"><Input value={value.imageUrl} onChange={(e) => setValue({...value, imageUrl: e.target.value})} placeholder="URL hình ảnh" />
        <ImageUploader onUploadComplete={(image) => setValue({...value, imageUrl: image.url})} />
        {value.imageUrl && <img src={value.imageUrl} alt="Hero preview" className="h-28 w-full rounded-md object-cover" />}
      </div>
      <div className="space-y-2"><Input value={value.title} onChange={(e) => setValue({...value, title: e.target.value})} placeholder="Title" />
        <textarea value={value.content} onChange={(e) => setValue({...value, content: e.target.value})} placeholder="Content" className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm" />
        <div className="flex gap-2"><Input type="number" value={value.sortOrder} onChange={(e) => setValue({...value, sortOrder: Number(e.target.value)})} className="w-24" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value.isActive} onChange={(e) => setValue({...value, isActive: e.target.checked})} /> Hiển thị</label>
          <Button size="sm" className="ml-auto" onClick={() => onSave(value)} disabled={!value.title.trim() || !value.imageUrl.trim()}><Save className="mr-2 h-4 w-4" />{submitLabel}</Button></div>
      </div>
    </div>
  }

  return <div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Hero Slider</h1><p className="text-sm text-muted-foreground">Quản lý title, nội dung và hình ảnh trang chủ.</p></div><Button onClick={() => setCreating(!creating)}><Plus className="mr-2 h-4 w-4" />Thêm slide</Button></div>
    {creating && <Card><CardContent className="pt-6"><Editor initial={form} onSave={(value) => create.mutate(value)} submitLabel="Tạo" /></CardContent></Card>}
    {isLoading ? <p className="text-sm text-muted-foreground">Đang tải...</p> : slides.map((slide) => <Card key={slide.id}><CardContent className="pt-6"><Editor initial={{title: slide.title.vi || "", content: slide.subtitle.vi || "", imageUrl: slide.imageUrl, sortOrder: slide.sortOrder, isActive: slide.isActive}} onSave={(body) => update.mutate({id: slide.id, body})} submitLabel="Lưu" /><Button variant="ghost" size="sm" className="mt-3 text-destructive" onClick={() => remove.mutate(slide.id)}><Trash2 className="mr-2 h-4 w-4" />Xóa</Button></CardContent></Card>)}</div>
}
