import { useState } from "react";
import { X, Copy, Palette, Tag, FileText, Sparkles, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fabApps } from "../data/fabApps";

export default function TemplateCloner({ template, onClose, onClone }) {
  const [step, setStep] = useState(1);
  const [customization, setCustomization] = useState({
    name: `${template.name} (Copy)`,
    tagline: template.tagline,
    category: template.category,
    industry: template.industry,
    primaryColor: template.accent?.includes("#") 
      ? template.accent.match(/#[0-9A-Fa-f]{6}/)?.[0] || "#612D91"
      : "#612D91",
    secondaryColor: "#A64AC9",
    description: template.description,
  });

  const handleClone = () => {
    const clonedTemplate = {
      ...template,
      id: `${template.id}-clone-${Date.now()}`,
      name: customization.name,
      tagline: customization.tagline,
      category: customization.category,
      industry: customization.industry,
      description: customization.description,
      accent: `from-[${customization.primaryColor.replace('#', '')}] to-[${customization.secondaryColor.replace('#', '')}]`,
      status: "Preview",
      statusColor: "bg-amber-100 text-amber-700",
      isCloned: true,
      clonedFrom: template.id,
      clonedAt: new Date().toISOString(),
    };
    
    onClone?.(clonedTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white">
          <div className="flex items-center gap-3">
            <Copy className="w-5 h-5" />
            <div>
              <h2 className="text-xl font-bold">Clone Template</h2>
              <p className="text-sm text-white/80">Create a customized version of {template.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                      step >= s
                        ? "bg-[#612D91] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  <span
                    className={`text-sm font-medium ml-2 ${
                      step >= s ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {s === 1 ? "Basic Info" : s === 2 ? "Customize" : "Review"}
                  </span>
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      step > s ? "bg-[#612D91]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#612D91]" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        value={customization.name}
                        onChange={(e) =>
                          setCustomization({ ...customization, name: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                        placeholder="Enter template name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={customization.tagline}
                        onChange={(e) =>
                          setCustomization({ ...customization, tagline: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                        placeholder="Enter tagline"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <input
                          type="text"
                          value={customization.category}
                          onChange={(e) =>
                            setCustomization({ ...customization, category: e.target.value })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Industry
                        </label>
                        <input
                          type="text"
                          value={customization.industry}
                          onChange={(e) =>
                            setCustomization({ ...customization, industry: e.target.value })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={customization.description}
                        onChange={(e) =>
                          setCustomization({ ...customization, description: e.target.value })
                        }
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                        placeholder="Enter description"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#612D91]" />
                    Customize Appearance
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customization.primaryColor}
                            onChange={(e) =>
                              setCustomization({
                                ...customization,
                                primaryColor: e.target.value,
                              })
                            }
                            className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={customization.primaryColor}
                            onChange={(e) =>
                              setCustomization({
                                ...customization,
                                primaryColor: e.target.value,
                              })
                            }
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                            placeholder="#612D91"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Secondary Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customization.secondaryColor}
                            onChange={(e) =>
                              setCustomization({
                                ...customization,
                                secondaryColor: e.target.value,
                              })
                            }
                            className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={customization.secondaryColor}
                            onChange={(e) =>
                              setCustomization({
                                ...customization,
                                secondaryColor: e.target.value,
                              })
                            }
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                            placeholder="#A64AC9"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                      <div
                        className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
                        style={{
                          background: `linear-gradient(to right, ${customization.primaryColor}, ${customization.secondaryColor})`,
                        }}
                      >
                        {customization.name}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#612D91]" />
                    Review & Create
                  </h3>
                  <div className="space-y-4">
                    <div className="p-6 rounded-xl border border-gray-200 bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-4">Template Summary</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium text-gray-900">{customization.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium text-gray-900">{customization.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Industry:</span>
                          <span className="font-medium text-gray-900">{customization.industry}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Based on:</span>
                          <span className="font-medium text-gray-900">{template.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Colors:</span>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: customization.primaryColor }}
                            />
                            <div
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: customization.secondaryColor }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> This will create a new template based on {template.name}. 
                        You can further customize it after creation.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={step > 1 ? () => setStep(step - 1) : onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {step > 1 ? "Back" : "Cancel"}
          </button>
          <button
            onClick={step < 3 ? () => setStep(step + 1) : handleClone}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
          >
            {step < 3 ? (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Create Template
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

