// Types for the template editor components
export type UploadState = "idle" | "file" | "paste" | "uploading" | "success" | "error";

export type EditorTab = "images" | "title" | "description" | "specs" | "company";

export type PreviewMode = "desktop" | "tablet" | "mobile";

export interface Image {
  id: string;
  url: string;
}

export interface TechSpec {
  id: string;
  label: string;
  value: string;
}

export interface CompanySection {
  id: string;
  title: string;
  description: string;
  svg: string;
}

export interface ProductTag {
  id: string;
  label: string;
}

export interface TemplateData {
  title: string;
  titleSelector?: string;
  company_name: string;
  companyNameSelector?: string;
  subtitle?: string;
  subtitleSelector?: string;
  price?: string;
  priceSelector?: string;
  currency?: string;
  currencySelector?: string;
  description?: string;
  descriptionSelector?: string;
  descriptionTitle?: string;
  logo?: string;
  logoSelector?: string;
  logoSize?: string;
  images: Image[];
  specs: TechSpec[];
  companyInfo: CompanySection[];
  tags?: ProductTag[];
  priceNote?: string;
  cartButtonText?: string;
  buyButtonText?: string;
  rawHtml?: string;
  techImage?: string;
}

export interface FileUploadResponse {
  filename: string;
  content: string;
}

export interface ImageUploadResponse {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  userId?: string;
  uploadedAt: string;
}

export interface SvgEditorProps {
  svg: string;
  sectionId: string;
  onSave: (svg: string, sectionId: string) => void;
  onClose: () => void;
}

export interface SvgPreset {
  id: string;
  name: string;
  svg: string;
  category: string;
}

export interface EditorSectionProps {
  data: TemplateData;
  onUpdate: (updatedData: Partial<TemplateData>) => void;
}
