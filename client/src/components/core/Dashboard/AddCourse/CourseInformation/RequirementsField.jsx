import React, { useEffect, useState } from 'react'

const RequirementsField = ({
    name,
    label,
    register,
    setValue,
    errors,
    getValues,
}) => {

    const [requirement, setRequirement] = useState("")
    const [requirementsList, setRequirementsList] = useState([])


    useEffect(()=>{
        register(name,{
            required:true,
        })
    },[])


    useEffect(()=>{
        setValue(name,requirementsList)
    },[requirementsList])

    const handleAddRequirement=()=>{
        if(requirement){
            setRequirementsList([...requirementsList,requirement])
            setRequirement("")
        }
    }

    const handleRemoveRequirement=(index)=>{
        const updatedRequirementList=[...requirementsList];
        updatedRequirementList.splice(index,1);
        setRequirementsList(updatedRequirementList);
    }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>
      <div className="flex flex-col items-start space-y-2">
        <input
          type="text"
          id={name}
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          className="form-style w-full"
        />
        <button
          type="button"
          onClick={handleAddRequirement}
          className="font-semibold text-yellow-50"
        >
          Add
        </button>
      </div>
      {requirementsList.length > 0 && (
        <ul className="mt-2 list-inside list-disc">
          {requirementsList.map((requirement, index) => (
            <li key={index} className="flex items-center text-richblack-5">
              <span>{requirement}</span>
              <button
                type="button"
                className="ml-2 text-xs text-pure-greys-300 "
                onClick={() => handleRemoveRequirement(index)}
              >
                clear
              </button>
            </li>
          ))}
        </ul>
      )}
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}

export default RequirementsField
