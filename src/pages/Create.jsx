import React, { useState, useRef } from "react";
import { questions } from "../constants";
import QuestionPage from "../components/Questions";

export default function Create() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);

    // UI states for PDF + progress
    const [pdfUrl, setPdfUrl] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);
    const progressTimer = useRef(null);

    // Save modal state and metadata for library entry
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [meta, setMeta] = useState({
        title: `Cheatsheet - ${new Date().toLocaleString()}`,
        subject: "",
        description: "",
    });

    // Combined max for PDFs + Images
    const MAX_UPLOADS = 5; // adjust as needed

    // Selected files (kept separate for backend fields), but validated together
    const [pdfFiles, setPdfFiles] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);

    const onPickMixed = (e) => {
        const picked = Array.from(e.target.files || []);
        const nextPdfs = [];
        const nextImages = [];

        for (const f of picked) {
            const name = f.name.toLowerCase();
            if (f.type === "application/pdf" || name.endsWith(".pdf")) {
                nextPdfs.push(f);
            } else if (f.type.startsWith("image/")) {
                nextImages.push(f);
            }
        }

        const total = nextPdfs.length + nextImages.length;
        if (total === 0) {
            alert("Please select only PDFs or images.");
            e.target.value = "";
            return;
        }
        if (total > MAX_UPLOADS) {
            alert(`You can select up to ${MAX_UPLOADS} files total (PDFs + images).`);
            e.target.value = "";
            return;
        }

        setPdfFiles(nextPdfs);
        setImageFiles(nextImages);
    };

    const clearFiles = () => {
        setPdfFiles([]);
        setImageFiles([]);
    };

    const startProgress = () => {
        if (progressTimer.current) clearInterval(progressTimer.current);
        setProgress(0);
        // Approximate progress to 90% while the server is working
        progressTimer.current = setInterval(() => {
            setProgress((p) => Math.min(p + 2 + Math.random() * 6, 90));
        }, 250);
    };

    const stopProgress = () => {
        if (progressTimer.current) clearInterval(progressTimer.current);
        setProgress(100);
    };

    // Call backend to generate PDF with restrictions + combined files and capture blob URL
    const generatePdf = async (restrictions, files) => {
        setSubmitting(true);
        setPdfUrl(null);
        startProgress();
        try {
            const form = new FormData();
            form.append("restrictions", restrictions);
            (files || []).forEach((f) => form.append("files", f));

            const res = await fetch("http://localhost:8000/generate-pdf", {
                method: "POST",
                headers: {
                    // Don't set Content-Type manually for FormData; keep Accept
                    Accept: "application/pdf",
                },
                body: form,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (err) {
            alert("Failed to generate PDF.");
            window.location.href = "/";
        } finally {
            stopProgress();
            setSubmitting(false);
        }
    };

    // Upload the generated PDF blob and metadata to backend to append to JSON library
    const saveToLibrary = async () => {
        if (!pdfUrl) return;
        try {
            const blob = await fetch(pdfUrl).then((r) => r.blob());
            const form = new FormData();
            form.append("title", meta.title || "");
            form.append("subject", meta.subject || "");
            form.append("description", meta.description || "");
            form.append("file", new File([blob], "result.pdf", { type: "application/pdf" }));

            const res = await fetch("http://localhost:8000/api/cheatsheets/add", {
                method: "POST",
                body: form,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await res.json();
            setShowSaveModal(false);
            alert("Saved to library.");
        } catch (e) {
            console.error("Failed to save to library", e);
            alert("Failed to save. See console for details.");
        }
    };

    const handleCurrent = async (selectedOptions) => {
        // 1) Compose new answer for this question
        const newAnswerPayload = {
            questionId: questions[currentIndex].id,
            answers: selectedOptions,
        };

        // 2) Persist with functional update
        setAnswers((currentAnswers) => [...currentAnswers, newAnswerPayload]);

        const isLastQuestion = currentIndex === questions.length - 1;

        if (isLastQuestion) {
            // Use local combination to avoid stale state
            const finalAnswers = [...answers, newAnswerPayload];

            // 3) Build restrictions string
            const restrictions = finalAnswers
                .map((ans) => {
                    return (
                        questions[ans.questionId].restrictionPreffix +
                        ans.answers.join(", ") +
                        questions[ans.questionId].restrictionSuffix
                    );
                })
                .join(" ");

            // Validate total files: require 1..MAX_UPLOADS across PDFs + images
            const totalFiles = pdfFiles.length + imageFiles.length;
            if (totalFiles < 1) {
                alert("Please select at least one PDF or image.");
                return;
            }
            if (totalFiles > MAX_UPLOADS) {
                alert(`You can select up to ${MAX_UPLOADS} files total.`);
                return;
            }
            console.log("Final files:", [...pdfFiles, ...imageFiles]);

            // 4) Ask backend for PDF (multipart with combined files)
            // mark submitting here so the Next button (in Questions) becomes disabled immediately
            setSubmitting(true);
           await generatePdf(restrictions, [...pdfFiles, ...imageFiles]);
        } else {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    return (
        <div className="create-container">
            {/* Mixed files picker (PDFs + Images) */}
            {!pdfUrl && (
                <div className="files-picker">
                    <div className="picker-card">
                        <label className="picker-label">
                            <input
                                className="hidden-file-input"
                                type="file"
                                accept=".pdf,application/pdf,image/*"
                                multiple
                                onChange={onPickMixed}
                            />
                            <div className="picker-cta">
                                <div className="picker-title">Upload files</div>
                                <div className="picker-sub">PDFs and images · up to {MAX_UPLOADS} files total</div>
                            </div>
                        </label>

                        {(pdfFiles.length + imageFiles.length) > 0 && (
                            <>
                                <div className="file-chips">
                                    {pdfFiles.map((f, i) => (
                                        <span className="chip pdf" key={`p-${i}`}>{f.name}</span>
                                    ))}
                                    {imageFiles.map((f, i) => (
                                        <span className="chip image" key={`i-${i}`}>{f.name}</span>
                                    ))}
                                </div>
                                <div className="picker-actions">
                                    <button className="clear-files-btn" type="button" onClick={clearFiles}>Clear</button>
                                    <span className="picker-count">
                                        {pdfFiles.length + imageFiles.length} selected — {pdfFiles.length} PDFs, {imageFiles.length} images
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                    {(currentIndex === questions.length - 1) && (pdfFiles.length + imageFiles.length === 0) && (
                        <p className="picker-warning">Please add at least one file before finishing.</p>
                    )}
                </div>
            )}
            {/* Show the questionnaire until a PDF is ready */}
            {!pdfUrl && (
                    <QuestionPage
                        question={questions[currentIndex]}
                        onNext={handleCurrent}
                        disableNext={
                            submitting ||
                            ((currentIndex === questions.length - 1) && ((pdfFiles.length + imageFiles.length) === 0))
                        }
                    />
            )}

            {/* Progress bar while generating */}
            {submitting && (
                <div className="progress-wrap">
                    <div className="progress">
                        <div
                            className="progress-bar"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="progress-text">{Math.round(progress)}%</div>
                </div>
            )}

            {/* PDF preview + download */}
            {pdfUrl && (
                <div className="pdf-container">
                    <iframe
                        title="Generated PDF"
                        src={pdfUrl}
                        className="pdf-frame"
                    />
                    <a
                        className="download-btn"
                        href={pdfUrl}
                        download="result.pdf"
                    >
                        Download PDF
                    </a>
                    <button className="download-btn" type="button" onClick={() => setShowSaveModal(true)}>
                        Add to Library
                    </button>
                </div>
            )}

            {showSaveModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ background: "#fff", padding: 20, borderRadius: 8, width: 420, maxWidth: "90%" }}>
                        <h3>Save Cheatsheet</h3>
                        <div style={{ display: "grid", gap: 10 }}>
                            <label>
                                Title
                                <input
                                    style={{ width: "100%" }}
                                    value={meta.title}
                                    onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                                />
                            </label>
                            <label>
                                Subject
                                <input
                                    style={{ width: "100%" }}
                                    value={meta.subject}
                                    onChange={(e) => setMeta({ ...meta, subject: e.target.value })}
                                />
                            </label>
                            <label>
                                Description
                                <textarea
                                    style={{ width: "100%" }}
                                    rows={3}
                                    value={meta.description}
                                    onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                                />
                            </label>
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                            <button onClick={() => setShowSaveModal(false)}>Cancel</button>
                            <button className="download-btn" onClick={saveToLibrary}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}