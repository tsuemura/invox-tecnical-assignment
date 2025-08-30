-- CreateTable
CREATE TABLE "ai_analysis_log" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "image_path" TEXT,
    "success" BOOLEAN NOT NULL,
    "message" TEXT,
    "class" INTEGER,
    "confidence" REAL,
    "request_timestamp" DATETIME NOT NULL,
    "response_timestamp" DATETIME NOT NULL
);
