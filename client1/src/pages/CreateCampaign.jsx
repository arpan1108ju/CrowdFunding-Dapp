import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

import { useStateContext } from "../context";
import { money } from "../assets";
import { CustomButton, FormField, Loader } from "../components";
import { checkIfImage, getLocalTimeOffset } from "../utils";
import { toast } from "react-toastify";
import CustomTooltip from "../components/CustomTooltip";

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const { createCampaign, account } = useStateContext();

  const one_hour_ms = 3600 * 1000;

  // Initial date and time
  const initialDeadlineDate = new Date().toLocaleDateString("en-CA"); // "en-CA" for YYYY-MM-DD format
  const initialDeadlineTime = new Date(new Date().getTime() + one_hour_ms)
    .toISOString()
    .slice(11, 23); // "HH:MM:SS.000"

  const initialData = {
    name: "",
    title: "",
    description: "",
    campaignType: "",
    target: "",
    deadline: initialDeadlineDate, // Initial deadline date
    image: "",
    time: initialDeadlineTime, // Initial deadline time
  };

  const [form, setForm] = useState(initialData);

  const handleFormFieldChange = (fieldName, e) => {
    const value = e.target.value;

      setForm((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;
    setIsLoading(true);

    checkIfImage(form.image, async (exists) => {
      if (exists) {
        try {
          console.log("Creating campaign...");
          const success = await createCampaign({
            ...form,
            target: ethers.parseUnits(form.target, 18),
          });
          if (success) navigate("/");
        } catch (error) {
          console.error("Error creating campaign:", error);
          toast.error("Failed to create campaign. Please try again.");
        } finally {
          setForm(initialData); // Reset form fields
          setIsLoading(false); // Reset loading state
        }
      } else {
        toast.error("Provide a valid image URL");
        setForm((prev) => ({
          ...prev,
          image: "",
        }));
        setIsLoading(false);
      }
    });
  };

  const AllNotNull = form.name.length && form.title.length && form.description.length &&
  form.campaignType.length && form.target.length && form.image.length;

  
  const isSubmitDisabled = isLoading || !account || !AllNotNull;
  

  const getSubmitButtonTooltip = () => {
    if (isLoading) return "Loading... Please wait.";
    if (!account) return "Connect your wallet to create campaign.";
    if (!AllNotNull) return "Please fill in all required fields.";
    return ""; // No tooltip if enabled
  };

  const submitButtonTooltip = getSubmitButtonTooltip();

  return (
    <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      {isLoading && <Loader />}
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">
          Start a Campaign
        </h1>
      </div>

      <form className="w-full mt-[65px] flex flex-col gap-[30px]">
        <div className="flex flex-wrap gap-[40px]">
          <FormField
            labelName="Your Name *"
            placeholder="John Doe"
            inputType="text"
            value={form.name}
            handleChange={(e) => handleFormFieldChange("name", e)}
          />
          <FormField
            labelName="Campaign Title *"
            placeholder="Write a title"
            inputType="text"
            value={form.title}
            handleChange={(e) => handleFormFieldChange("title", e)}
          />
          <FormField
            labelName="Campaign Type *"
            placeholder="Write a type"
            inputType="text"
            value={form.campaignType}
            handleChange={(e) => handleFormFieldChange("campaignType", e)}
          />
        </div>

        <FormField
          labelName="Story *"
          placeholder="Write your story"
          isTextArea
          value={form.description}
          handleChange={(e) => handleFormFieldChange("description", e)}
        />

        <div className="w-full flex justify-start items-center p-4 bg-[#8c6dfd] h-[120px] rounded-[10px]">
          <img src={money} alt="money" className="w-[40px] h-[40px] object-contain" />
          <h4 className="font-epilogue font-bold text-[25px] text-white ml-[20px]">
            You will get 100% of the raised amount
          </h4>
        </div>

        <div className="flex flex-col gap-[40px]">
          <FormField
            labelName="Goal *"
            placeholder="ETH 0.50"
            inputType="text"
            value={form.target}
            handleChange={(e) => handleFormFieldChange("target", e)}
          />
          <FormField
            labelName="End Date *"
            placeholder="End Date"
            inputType="date"
            value={form.deadline}
            handleChange={(e) => handleFormFieldChange("deadline", e)}
          />

          <label className="flex-1 w-full">
            <span className="font-epilogue font-medium text-[14px] text-[#808191]">
              Show Time (Time is set according to UTC) [Current time {getLocalTimeOffset()}]
            </span>
            <input
              value={checkboxValue}
              onChange={() => setCheckboxValue(!checkboxValue)}
              type="checkbox"
              className="ml-4 scale-110"
            />
          </label>

          {checkboxValue && (
            <FormField
              labelName="End Time *"
              placeholder="End Time"
              inputType="time"
              value={form.time}
              handleChange={(e) => handleFormFieldChange("time", e)}
            />
          )}
        </div>

        <FormField
          labelName="Campaign image *"
          placeholder="Place image URL of your campaign"
          inputType="url"
          value={form.image}
          handleChange={(e) => handleFormFieldChange("image", e)}
        />

        <div className="flex justify-center items-center mt-[40px]">
          <CustomTooltip hidden={!isSubmitDisabled} name={isSubmitDisabled ? submitButtonTooltip : ""}>
            <CustomButton
              btnType="submit"
              handleClick={handleSubmit}
              title="Submit new campaign"
              styles="bg-[#1dc071]"
              disabled={isSubmitDisabled}
            />
          </CustomTooltip>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;
