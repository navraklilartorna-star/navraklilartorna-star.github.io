import { useRef, useState } from 'react'
import { Activity, ArrowRight, CheckCircle2, FileUp, Gauge, Layers3, ShieldCheck, Sparkles, UploadCloud, Wrench } from 'lucide-react'

const machineTypes = ['2 eksen CNC torna', 'C / Y eksenli torna-freze', 'Çift aynalı / çok taretli', 'Swiss tipi kayar otomat']
const operations = ['Alın tornalama', 'Dış çap tornalama', 'Kademe', 'Pah kırma', 'Kanal açma', 'Delik delme', 'Vida / diş açma']
const materials = ['St37 / S235', 'C45', '4140 / 42CrMo4', 'Alüminyum', 'Paslanmaz çelik', 'Pirinç', 'Diğer']

type Dimensions = {
  stockDiameter: string
  stockLength: string
  finishedDiameter: string
  finishedLength: string
}

export default function App() {
  const [description, setDescription] = useState('')
  const [partName, setPartName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [dimensions, setDimensions] = useState<Dimensions>({ stockDiameter: '', stockLength: '', finishedDiameter: '', finishedLength: '' })
  const [machine, setMachine] = useState(machineTypes[0])
  const [control, setControl] = useState('Fanuc')
  const [material, setMaterial] = useState(materials[0])
  const [file, setFile] = useState<File | null>(null)
  const [selectedOps, setSelectedOps] = useState<string[]>(['Alın tornalama', 'Dış çap tornalama', 'Kademe'])
  const [notice, setNotice] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function toggleOperation(op: string) {
    setSelectedOps(current => current.includes(op) ? current.filter(x => x !== op) : [...current, op])
    setSubmitted(false)
  }

  function updateDimension(key: keyof Dimensions, value: string) {
    setDimensions(current => ({ ...current, [key]: value }))
    setSubmitted(false)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const enteredDimensions = Object.entries(dimensions).filter(([, value]) => value.trim() !== '')
    const invalidDimension = enteredDimensions.find(([, value]) => !Number.isFinite(Number(value)) || Number(value) <= 0)
    if (!description.trim() && !file) {
      setNotice('Lütfen parça tarifini yazın veya teknik resim yükleyin.')
      setSubmitted(false)
      return
    }
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      setNotice('Üretim adedi en az 1 olan tam sayı olmalıdır.')
      setSubmitted(false)
      return
    }
    if (invalidDimension) {
      setNotice('Girilen ölçüler sıfırdan büyük sayısal değerler olmalıdır.')
      setSubmitted(false)
      return
    }
    if (selectedOps.length === 0) {
      setNotice('Lütfen en az bir üretim işlemi seçin.')
      setSubmitted(false)
      return
    }
    setNotice('İş emri taslağı oluşturuldu. Bilgiler henüz sunucuya kaydedilmedi; bu prototipte yalnızca ekranda özetlenir.')
    setSubmitted(true)
  }

  const dimensionRows = [
    ['Ham çap', dimensions.stockDiameter],
    ['Ham boy', dimensions.stockLength],
    ['Bitmiş çap', dimensions.finishedDiameter],
    ['Bitmiş boy', dimensions.finishedLength]
  ].filter(([, value]) => value !== '')

  return <main className="shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark"><Wrench size={21} /></span><span>KODLAMATIC<small>ENGINEERING & TECHNOLOGIES</small></span></a>
      <span className="version"><span className="pulse" /> PROTOTİP · v0.2</span>
    </header>

    <section className="hero">
      <div className="eyebrow"><Sparkles size={14} /> YENİ NESİL CNC PROGRAMLAMA</div>
      <h1>Parçanı anlat.<br /><em>Üretim planını</em> birlikte oluşturalım.</h1>
      <p>Parça tarifini, temel ölçülerini ve tezgâh bilgilerini gir. Önce eksiksiz bir iş emri oluşturalım; güvenli takım yolu ve makineye özel programlama altyapısını adım adım kuralım.</p>
      <div className="hero-points">
        <span><CheckCircle2 size={16} /> Türkçe parça tarifi</span>
        <span><CheckCircle2 size={16} /> Ölçülü iş emri</span>
        <span><CheckCircle2 size={16} /> Çoklu makine hedefi</span>
      </div>
    </section>

    <form className="workspace" onSubmit={submit}>
      <section className="panel main-panel">
        <div className="panel-heading"><div className="step">01</div><div><h2>Parçayı tanımla</h2><p>İş emri, ölçüler ve istenen işlemler.</p></div></div>
        <div className="form-grid">
          <div className="form-field">
            <label className="field-label" htmlFor="part-name">Parça / iş adı <span className="optional">İsteğe bağlı</span></label>
            <input id="part-name" value={partName} onChange={e => { setPartName(e.target.value); setSubmitted(false) }} placeholder="Örnek: Mil burcu" />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="quantity">Üretim adedi</label>
            <input id="quantity" type="number" min="1" step="1" value={quantity} onChange={e => { setQuantity(e.target.value); setSubmitted(false) }} />
          </div>
        </div>
        <label className="field-label" htmlFor="part-description">Parçayı Türkçe tarif et</label>
        <textarea id="part-description" value={description} onChange={e => { setDescription(e.target.value); setSubmitted(false) }} placeholder="Örnek: Ø50 mm çapında, toplam 120 mm uzunluğunda yuvarlak çelik. Ön yüz alınacak, 30 mm boyunca Ø40 mm kademeye düşülecek ve uç kısmına 2 mm pah kırılacak." rows={5} />
        <div className="field-note">Bildiğin ölçüleri yaz. Eksik veya belirsiz ölçüler tahmin edilmemeli; ayrıca teyit edilmeli.</div>
        <div className="section-divider" />
        <div className="subheading"><Gauge size={17} /> Temel parça ölçüleri <span className="optional">mm · İsteğe bağlı</span></div>
        <div className="form-grid dimensions-grid">
          <div className="form-field"><label className="field-label" htmlFor="stock-diameter">Ham malzeme çapı</label><div className="input-unit"><input id="stock-diameter" type="number" min="0" step="any" value={dimensions.stockDiameter} onChange={e => updateDimension('stockDiameter', e.target.value)} placeholder="Örn. 50" /><span>mm</span></div></div>
          <div className="form-field"><label className="field-label" htmlFor="stock-length">Ham malzeme boyu</label><div className="input-unit"><input id="stock-length" type="number" min="0" step="any" value={dimensions.stockLength} onChange={e => updateDimension('stockLength', e.target.value)} placeholder="Örn. 125" /><span>mm</span></div></div>
          <div className="form-field"><label className="field-label" htmlFor="finished-diameter">Bitmiş parça çapı</label><div className="input-unit"><input id="finished-diameter" type="number" min="0" step="any" value={dimensions.finishedDiameter} onChange={e => updateDimension('finishedDiameter', e.target.value)} placeholder="Örn. 40" /><span>mm</span></div></div>
          <div className="form-field"><label className="field-label" htmlFor="finished-length">Bitmiş parça boyu</label><div className="input-unit"><input id="finished-length" type="number" min="0" step="any" value={dimensions.finishedLength} onChange={e => updateDimension('finishedLength', e.target.value)} placeholder="Örn. 120" /><span>mm</span></div></div>
        </div>
        <div className="field-note">Ölçüler girilirse sayısal kontrol yapılır. Bu aşamada tolerans, paso veya takım yolu hesabı yapılmaz.</div>
        <div className="upload-box" onClick={() => fileRef.current?.click()} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.dxf,.step,.stp" onChange={e => { setFile(e.target.files?.[0] ?? null); setSubmitted(false) }} hidden />
          <span className="upload-icon"><UploadCloud size={23} /></span>
          <span className="upload-copy"><b>{file ? file.name : 'Teknik resim veya model yükle'}</b><small>{file ? ((file.size / 1024 / 1024).toFixed(2) + ' MB · Dosya seçildi') : 'PDF, PNG, JPG, DXF, STEP · Dosya seçmek için dokun'}</small></span>
          <FileUp size={19} className="upload-action" />
        </div>
        <div className="section-divider" />
        <div className="subheading"><Layers3 size={17} /> İstenen işlemler</div>
        <div className="operation-grid">{operations.map(op => <button type="button" key={op} className={selectedOps.includes(op) ? 'operation selected' : 'operation'} onClick={() => toggleOperation(op)}>{selectedOps.includes(op) && <CheckCircle2 size={14} />} {op}</button>)}</div>
      </section>

      <aside className="side-column">
        <section className="panel">
          <div className="panel-heading compact"><div className="step">02</div><div><h2>Makine ayarları</h2><p>Hedef tezgâh ve kontrol ünitesi.</p></div></div>
          <label className="field-label" htmlFor="machine">Makine tipi</label>
          <select id="machine" value={machine} onChange={e => { setMachine(e.target.value); setSubmitted(false) }}>{machineTypes.map(item => <option key={item}>{item}</option>)}</select>
          <label className="field-label" htmlFor="control">Kontrol ünitesi</label>
          <select id="control" value={control} onChange={e => { setControl(e.target.value); setSubmitted(false) }}>{['Fanuc', 'Siemens', 'Mitsubishi', 'Haas', 'Mazatrol', 'Diğer / Henüz belli değil'].map(item => <option key={item}>{item}</option>)}</select>
          <label className="field-label" htmlFor="material">Malzeme</label>
          <select id="material" value={material} onChange={e => { setMaterial(e.target.value); setSubmitted(false) }}>{materials.map(item => <option key={item}>{item}</option>)}</select>
        </section>
        <section className="safety-card"><div className="safety-icon"><ShieldCheck size={20} /></div><div><b>Önce güvenlik</b><p>Bu prototip makineye kod göndermez. Gerçek G-kod; geometri, takım yolu, çarpışma ve kontrol ünitesi doğrulamasından sonra uzman onayıyla hazırlanmalıdır.</p></div></section>
        <button className="submit-button" type="submit">İş emrini kontrol et <ArrowRight size={18} /></button>
        {notice && <div className="notice" role="status">{notice}</div>}
        {submitted && <section className="review-card">
          <div className="review-heading"><CheckCircle2 size={17} /><b>İş emri özeti</b></div>
          <dl>
            <div><dt>Parça</dt><dd>{partName.trim() || 'İsim belirtilmedi'}</dd></div>
            <div><dt>Adet</dt><dd>{quantity}</dd></div>
            <div><dt>Malzeme</dt><dd>{material}</dd></div>
            <div><dt>Makine</dt><dd>{machine}</dd></div>
            <div><dt>Kontrol</dt><dd>{control}</dd></div>
            {dimensionRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value} mm</dd></div>)}
            <div><dt>İşlemler</dt><dd>{selectedOps.join(', ')}</dd></div>
            {file && <div><dt>Dosya</dt><dd>{file.name}</dd></div>}
          </dl>
          <p className="review-footnote">Bu bir ön kayıt özetidir; henüz kaydedilmedi veya teknik olarak analiz edilmedi.</p>
        </section>}
        <div className="status-line"><Activity size={15} /><span>Şu an: iş emri arayüzü · Sunucu kaydı ve G-kod üretimi kapalı</span></div>
      </aside>
    </form>
    <footer><span>KODLAMATIC</span><span><Gauge size={14} /> Güvenli üretim için doğrulama odaklı geliştirme</span></footer>
  </main>
}
