import React, { useState } from "react";
import System from "@/models/system";
import showToast from "@/utils/toast";
import pluralize from "pluralize";
import { useTranslation } from "react-i18next";

export default function DirectoryDepthOptions() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    try {
      setLoading(true);
      showToast("Scraping directory - this may take a while.", "info", {
        clear: true,
        autoClose: false,
      });

      const { data, error } = await System.dataConnectors.directoryDepth.scrape({
        path: form.get("path"),
        extensions: form.get("extensions").split(",")
      });

      if (!!error) {
        showToast(error, "error", { clear: true });
        setLoading(false);
        return;
      }

      showToast(
        `Successfully scraped ${data.length} ${pluralize(
          "directory",
          data.length
        )}!`,
        "success",
        { clear: true }
      );
      e.target.reset();
      setLoading(false);
    } catch (e) {
      console.error(e);
      showToast(e.message, "error", { clear: true });
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full">
      <div className="flex flex-col w-full px-1 md:pb-6 pb-16">
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="w-full flex flex-col py-2">
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col pr-10">
                <div className="flex flex-col gap-y-1 mb-4">
                  <label className="text-white text-sm font-bold">
                    {t("connectors.directory-depth.path")}
                  </label>
                </div>
                <input
                  type="text"
                  name="path"
                  className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                  placeholder="D:\tmp"
                  required={true}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col pr-10">
                <div className="flex flex-col gap-y-1 mb-4">
                  <label className="text-white text-sm font-bold">
                    {t("connectors.directory-depth.extensions")}
                  </label>
                </div>
                <input
                  type="text"
                  name="extensions"
                  className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                  placeholder=".pdf"
                  required={true}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-y-2 w-full pr-10">
            <button
              type="submit"
              disabled={loading}
              className={`mt-2 w-full ${
                loading ? "cursor-not-allowed animate-pulse" : ""
              } justify-center border border-slate-200 px-4 py-2 rounded-lg text-dark-text text-sm font-bold items-center flex gap-x-2 bg-slate-200 hover:bg-slate-300 hover:text-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed`}
            >
              {loading ? "Scraping directory..." : "Submit"}
            </button>
            {loading && (
              <p className="text-xs text-theme-text-secondary">
                {t("connectors.directory-depth.task_explained")}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
