// import React, {useState} from 'react'
// import {
//     Document,
//     Page,
//     Text,
//     View,
//     StyleSheet,
//     PDFViewer,
//     Font,
// } from '@react-pdf/renderer'
// import {Button} from "@/components/ui/button";
// import {FileText} from "lucide-react";
// import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
// import {FormField} from "@prisma/client";
// import {Card, CardContent} from "@/components/ui/card";
//
// // First, register a font (optional but recommended for better styling)
// Font.register({
//     family: 'Inter',
//     src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
// })
//
// // Create styles
// const styles = StyleSheet.create({
//     page: {
//         flexDirection: 'column',
//         backgroundColor: '#ffffff',
//         padding: 30,
//         fontFamily: 'Inter',
//     },
//     title: {
//         fontSize: 24,
//         marginBottom: 10,
//         fontWeight: 'bold',
//     },
//     description: {
//         fontSize: 12,
//         marginBottom: 20,
//         color: '#666666',
//     },
//     section: {
//         marginBottom: 15,
//     },
//     fieldLabel: {
//         fontSize: 12,
//         fontWeight: 'bold',
//         marginBottom: 5,
//     },
//     fieldDescription: {
//         fontSize: 10,
//         color: '#666666',
//         marginBottom: 5,
//     },
//     required: {
//         color: '#FF0000',
//     },
//     input: {
//         borderWidth: 1,
//         borderColor: '#EEEEEE',
//         padding: 8,
//         marginBottom: 5,
//         minHeight: 30,
//     },
//     radioGroup: {
//         marginLeft: 10,
//     },
//     radioOption: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 5,
//     },
//     radioCircle: {
//         width: 12,
//         height: 12,
//         borderRadius: 6,
//         borderWidth: 1,
//         borderColor: '#000000',
//         marginRight: 8,
//     },
//     radioLabel: {
//         fontSize: 11,
//     },
//     checkbox: {
//         width: 12,
//         height: 12,
//         borderWidth: 1,
//         borderColor: '#000000',
//         marginRight: 8,
//     },
// })
//
// interface FormPDFProps {
//     form: {
//         title: string
//         description?: string
//         fields: FormField[]
//     }
// }
//
// const FormPDF: React.FC<FormPDFProps> = ({ form }) => {
//     const renderField = (field: FormField) => {
//         switch (field.type) {
//             case 'radio':
//                 return (
//                     <View style={styles.radioGroup}>
//                         {field.options?.map((option, index) => (
//                             <View key={index} style={styles.radioOption}>
//                                 <View style={styles.radioCircle} />
//                                 <Text style={styles.radioLabel}>{option.label}</Text>
//                             </View>
//                         ))}
//                     </View>
//                 )
//
//             case 'checkbox':
//                 return (
//                     <View style={styles.radioOption}>
//                         <View style={styles.checkbox} />
//                         <Text style={styles.radioLabel}>{field.label}</Text>
//                     </View>
//                 )
//
//             case 'textarea':
//                 return <View style={[styles.input, { height: 80 }]} />
//
//             case 'select':
//                 return (
//                     <View>
//                         {field.options?.map((option, index) => (
//                             <View key={index} style={styles.radioOption}>
//                                 <View style={styles.checkbox} />
//                                 <Text style={styles.radioLabel}>{option.label}</Text>
//                             </View>
//                         ))}
//                     </View>
//                 )
//
//             default:
//                 return <View style={styles.input} />
//         }
//     }
//
//     return (
//         <PDFViewer style={{ width: '100%', height: '100vh' }}>
//             <Document>
//                 <Page size="A4" style={styles.page}>
//                     <Text style={styles.title}>{form.title}</Text>
//                     {form.description && (
//                         <Text style={styles.description}>{form.description}</Text>
//                     )}
//
//                     {form.fields.map((field, index) => (
//                         <View key={index} style={styles.section}>
//                             <Text style={styles.fieldLabel}>
//                                 {field.label}
//                                 {field.required && <Text style={styles.required}> *</Text>}
//                             </Text>
//                             {field.description && (
//                                 <Text style={styles.fieldDescription}>{field.description}</Text>
//                             )}
//                             {renderField(field)}
//                         </View>
//                     ))}
//                 </Page>
//             </Document>
//         </PDFViewer>
//     )
// }
//
// // Add a button to your FormBuilder to generate PDF
// const PDFButton = () => {
//     const [showPDF, setShowPDF] = useState(false)
//
//     return (
//         <>
//             <Button
//                 variant="outline"
//                 onClick={() => setShowPDF(true)}
//                 className="w-full"
//             >
//                 <FileText className="h-4 w-4 mr-2" />
//                 Generate PDF
//             </Button>
//
//             <Dialog open={showPDF} onOpenChange={setShowPDF}>
//                 <DialogContent className="max-w-4xl h-[90vh]">
//                     <DialogHeader>
//                         <DialogTitle>Form PDF Preview</DialogTitle>
//                     </DialogHeader>
//                     <FormPDF
//                         form={{
//                             title,
//                             description,
//                             fields
//                         }}
//                     />
//                 </DialogContent>
//             </Dialog>
//         </>
//     )
// }
//
// // Update your FormBuilder buttons section
// {fields.length > 0 && (
//     <Card>
//         <CardContent className="pt-6 space-y-4">
//             <div className="flex gap-4">
//                 <Button
//                     variant="outline"
//                     className="w-full"
//                     onClick={() => setIsPreviewOpen(true)}
//                 >
//                     <Eye className="h-4 w-4 mr-2" />
//                     Preview Form
//                 </Button>
//                 <PDFButton />
//                 <Button
//                     onClick={handleSubmit}
//                     className="w-full"
//                 >
//                     Create Form
//                 </Button>
//             </div>
//         </CardContent>
//     </Card>
// )}