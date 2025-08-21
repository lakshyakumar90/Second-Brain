import React, { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, ArrowRight, UploadCloud } from "lucide-react";
import type { Control } from "react-hook-form";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { FileWithPath } from "react-dropzone";
import { useDropzone } from "react-dropzone";

const contactFormSchema = z.object({
  name: z.string().min(1, "Your name is required."),
  companyName: z.string().min(1, "Company name is required."),
  phone: z.string().optional(),
  email: z.string().email("A valid email is required."),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  projectDetails: z
    .string()
    .min(10, "Please tell us a bit more about your project."),
  heardFrom: z.string().optional(),
  attachments: z.array(z.custom<File>()).optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface BriefFormProps {
  onClose: () => void;
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: keyof ContactFormValues;
  label: string;
  control: Control<ContactFormValues>;
  error?: string;
}

interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: keyof ContactFormValues;
  label: string;
  control: Control<ContactFormValues>;
  error?: string;
}

const BriefForm: React.FC<BriefFormProps> = ({ onClose }) => {
  useEffect(() => {
    const scrollY = window.scrollY;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    // Ensure the modal itself can scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
      // Use setTimeout to ensure cleanup happens after component unmount
      setTimeout(() => {
        window.scrollTo(0, scrollY);
      }, 0);
    };
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      attachments: [],
    },
  });

  const attachments = watch("attachments") || [];

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      const newFiles = [...attachments, ...acceptedFiles].slice(0, 10);
      setValue("attachments", newFiles, { shouldValidate: true });
    },
    [attachments, setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 10,
    maxSize: 25 * 1024 * 1024, // 25MB
  });

  const onSubmit = (data: ContactFormValues) => {
    console.log("Form Data:", data);
    // Here you would typically send the data to your backend API
    onClose();
  };

  const removeFile = (fileToRemove: File) => {
    const newFiles = attachments.filter((file) => file !== fileToRemove);
    setValue("attachments", newFiles, { shouldValidate: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: "100vh" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100vh" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 bg-[#f3f3e9] z-50 overflow-y-auto overscroll-contain"
      data-lenis-prevent
      data-lenis-prevent-wheel
      data-lenis-prevent-touch
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="min-h-screen flex flex-col">
        <header className="p-4 sm:p-8 flex justify-end items-center">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <X size={28} />
          </button>
        </header>

        <main className="flex-grow px-4 sm:px-8 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-purple-600 mb-3">
                Let's get started.
              </h1>
              <p className="text-gray-500 text-base sm:text-lg">
                Fill in the blanks and we'll respond in one business day.
                <br />
                Just want to chat? Call or email, we're a nice bunch.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                <InputField
                  name="name"
                  label="What's your name?*"
                  placeholder="Your name here"
                  control={control}
                  error={errors.name?.message}
                />
                <InputField
                  name="companyName"
                  label="Name of your company?*"
                  placeholder="Widgets, Inc"
                  control={control}
                  error={errors.companyName?.message}
                />
                <InputField
                  name="phone"
                  label="How shall we contact you?*"
                  placeholder="Phone Number"
                  control={control}
                  error={errors.phone?.message}
                />
                <InputField
                  name="email"
                  label="Email Address*"
                  placeholder="Email Address"
                  control={control}
                  error={errors.email?.message}
                  type="email"
                />
                <InputField
                  name="budget"
                  label="Budget expectation"
                  placeholder="A transparent budget will help us ensure expectations are met."
                  control={control}
                  error={errors.budget?.message}
                />
                <InputField
                  name="timeline"
                  label="Timeline"
                  placeholder="If you have an ideal timeline or deadline, please let us know."
                  control={control}
                  error={errors.timeline?.message}
                />
              </div>

              <TextareaField
                name="projectDetails"
                label="Tell us about the project*"
                placeholder="Need a new Website? An App? Let us know how we can help."
                control={control}
                error={errors.projectDetails?.message}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please attach any relevant documents
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <UploadCloud className="w-12 h-12 mb-4" />
                    {isDragActive ? (
                      <p>Drop the files here ...</p>
                    ) : (
                      <p>
                        Drag file(s) here, or click to select from your device.
                      </p>
                    )}
                    <p className="text-xs mt-2">
                      Maximum 10 files of 25MB each. Maximum 100MB total.
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md text-sm"
                    >
                      <span className="font-medium truncate pr-4">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(file)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <InputField
                name="heardFrom"
                label="How did you hear about us?"
                placeholder="From a friend? From Google?"
                control={control}
                error={errors.heardFrom?.message}
              />
            </form>
          </div>
        </main>

        <footer className="p-8">
          <div className="max-w-4xl mx-auto flex justify-end items-center">
            <button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              className="flex items-center justify-center cursor-pointer gap-3 bg-purple-600 hover:bg-purple-700 transition-colors text-white text-lg sm:text-xl px-8 py-4 rounded-full w-full sm:w-auto"
            >
              Submit
              <ArrowRight size={24} />
            </button>
          </div>
        </footer>
      </div>
    </motion.div>
  );
};

const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  control,
  error,
  ...props
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            id={name}
            {...field}
            {...props}
            value={typeof field.value === "string" ? field.value : ""}
            className="mt-1 block w-full px-0.5 border-0 border-b-2 border-gray-300 focus:ring-0 focus:border-purple-600 transition focus:outline-none"
          />
        )}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

const TextareaField: React.FC<TextareaFieldProps> = ({
  name,
  label,
  control,
  error,
  ...props
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <textarea
            id={name}
            rows={4}
            {...field}
            {...props}
            value={typeof field.value === "string" ? field.value : ""}
            className="mt-1 block w-full px-0.5 border-0 border-b-2 border-gray-300 focus:ring-0 focus:border-purple-600 transition focus:outline-none"
          ></textarea>
        )}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default BriefForm;
