/**
 * Library Module — Consolidated De-Codification, Model Datasheets, and Document Master
 * with sub-tab navigation.
 */
import { useAppContext } from "../../context/AppContext";
import MasterDecodificationPanel from "../../components/MasterDecodificationPanel";
import ModelDatasheetsPanel from "../../components/ModelDatasheetsPanel";
import { useDocumentMaster } from "../../hooks/useDocumentMaster";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Hash, FileSpreadsheet, FolderArchive } from "lucide-react";

export default function LibraryModule() {
  const { state, dispatch } = useAppContext();
  const docMaster = useDocumentMaster();

  const docCount = docMaster.drawings.length;

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="font-medium">Library</span>
        </div>
        <div className="flex gap-3 text-xs">
          <Badge variant="outline">Product De-Codification</Badge>
          <Badge variant="outline">Model Datasheets</Badge>
          <Badge variant="outline" className="gap-1">
            <FolderArchive className="w-3 h-3" />{docCount} GA drawings
          </Badge>
        </div>
      </div>

      {/* Library Sub-Tab Navigation */}
      <Tabs value={state.librarySubTab} onValueChange={(v) => dispatch({ type: "SET_LIBRARY_SUB_TAB", tab: v as any })}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="de_codification" className="gap-2">
            <Hash className="w-4 h-4" /> De-Codification
          </TabsTrigger>
          <TabsTrigger value="model_datasheets" className="gap-2">
            <FileSpreadsheet className="w-4 h-4" /> Model Datasheets
          </TabsTrigger>
          <TabsTrigger value="document_master" className="gap-2">
            <FolderArchive className="w-4 h-4" /> Drawing Master
          </TabsTrigger>
        </TabsList>

        {/* De-Codification Tab */}
        <TabsContent value="de_codification" className="mt-4">
          <MasterDecodificationPanel />
        </TabsContent>

        {/* Model Datasheets Tab */}
        <TabsContent value="model_datasheets" className="mt-4">
          <ModelDatasheetsPanel />
        </TabsContent>

        {/* Drawing Master Tab */}
        <TabsContent value="document_master" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderArchive className="w-5 h-5 text-primary" />
                Drawing Master — GA Drawings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {docMaster.drawings.length === 0 ? (
                <div className="text-center py-12">
                  <FolderArchive className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No GA drawings in document master</p>
                  <p className="text-xs text-gray-400 mt-1">Upload GA drawings to link with datasheets</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {docMaster.drawings.map((drawing) => (
                    <div key={drawing.id} className="border rounded-lg p-3 hover:border-primary/30 transition-colors">
                      <div className="text-xs font-bold mb-1">{drawing.title || drawing.productName}</div>
                      <div className="text-[10px] text-muted-foreground mb-2">{drawing.drawingNo} &middot; {drawing.productFamily}</div>
                      {drawing.fileData && drawing.fileType === "png" || drawing.fileType === "jpg" ? (
                        <img src={drawing.fileData} alt={drawing.title}
                          className="w-full h-32 object-contain bg-gray-50 rounded mb-2" />
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
