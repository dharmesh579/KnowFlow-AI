import FileUpload from "../components/FileUpload";

export default function Home() {
  return (
    <div className="max-w-[70ch] mx-auto px-6 py-16">
      {/* KnowFlow-AI Logo */}
      <div className="mb-8">
        <img
          src="/knowflowimg.png"
          alt="KnowFlow-AI"
          className="w-72 mx-auto"
        />
      </div>

      <p className="text-stone mb-8 text-center">
        Upload a document, then ask questions — grounded in your document, the
        web, or both.
      </p>

      <FileUpload />
    </div>
  );
}
