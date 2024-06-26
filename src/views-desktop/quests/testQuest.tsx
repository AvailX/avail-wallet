/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/indent */
import * as React from "react";
import * as mui from "@mui/material";

// Components
import Layout from "../reusable/layout";
import SideMenu from "../../components/sidebar";
import QuestBox from "../../components/quests/quest";
import TaskDrawer from "../../components/quests/tasks_drawer";

// Types
import {
  campaign,
  quests,
  type CampaignDetailPageProps,
} from "../../types/quests/quest_types";
import { type Quest } from "../../types/quests/quest_types";

// Images
import verified from "../../assets/icons/verified.svg";

// Typography
import { BodyText500 } from "../../components/typography/typography";

// Services
import {
  createCampaign,
  createQuest,
  isQuestCompleted,
} from "../../services/quests/quests";

// Hooks
import { useLocation } from "react-router-dom";

// Alerts
import { SuccessAlert, ErrorAlert } from "../../components/snackbars/alerts";
import { Campaign, CampaignDescription } from "../../types/quests/quest_types";
import { time } from "console";
import { invoke } from "@tauri-apps/api/core";

const TestQaaS: React.FC = () => {
  const [fields, setFields] = React.useState([
    {
      title: "",
      description: "",
      transaction: "",
      program_id: "",
      function_id: "",
      dapp_url: "",
      points: "",
    },
  ]);

  const handleAddField = () => {
    setFields([
      ...fields,
      {
        title: "",
        description: "",
        transaction: false,
        program_id: "",
        function_id: "",
        dapp_url: "",
        points: "",
      },
    ]);
  };

  const handleFieldChange = (index: number, field: string, value: string) => {
    const updatedFields = [...fields];
    updatedFields[index][field] = value;
    setFields(updatedFields);
  };

  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const mdsx = mui.useMediaQuery("(min-width:850px)");
  const md = mui.useMediaQuery("(min-width:950px)");
  const mdlg = mui.useMediaQuery("(min-width:1150px)");
  const lgsx = mui.useMediaQuery("(min-width:1550px)");
  const lg = mui.useMediaQuery("(min-width:1750px)");
  const lgxl = mui.useMediaQuery("(min-width:1950px)");

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Create Campaign Clicked");
    // Console.log('Form:', e.target.elements);
    // print the form values
    console.log("Title:", e.target.elements[0].value);
    console.log("Sub title:", e.target.elements[2].value);
    console.log("Desc:", e.target.elements[4].value);
    console.log("DescMain:", e.target.elements[6].value);
    console.log("DescSec:", e.target.elements[8].value);
    console.log("DescInner:", e.target.elements[10].value);
    console.log("Box URL:", e.target.elements[12].value);
    console.log("BG URL:", e.target.elements[14].value);
    console.log("Profile URL:", e.target.elements[16].value);
    console.log("Color:", e.target.elements[18].value);
    console.log("Project Title:", e.target.elements[20].value);
    console.log("Points URL:", e.target.elements[22].value);
    // Let title = e.target.elements[0].value;
    // let subtitle = e.target.elements[2].value;
    // let description: CampaignDescription = {
    //     part1: e.target.elements[4].value,
    //     main: e.target.elements[6].value,
    //     part2: e.target.elements[8].value,
    // };
    // let inner_description = e.target.elements[10].value;
    // let box_image = e.target.elements[12].value;
    // let bg_image = e.target.elements[14].value;
    // let profile_image = e.target.elements[16].value;
    // let color = e.target.elements[18].value;
    // let project_name = e.target.elements[20].value;
    // let points_image = e.target.elements[22].value;

    // const [title, setTitle] = React.useState('');
    // const [subtitle, setSubtitle] = React.useState('');
    // const [description, setDescription] = React.useState('');
    // const [innerDescription, setInnerDescription] = React.useState('');
    // const [boxImage, setBoxImage] = React.useState('');
    // const [bgImage, setBgImage] = React.useState('');
    // const [profileImage, setProfileImage] = React.useState('');
    // const [color, setColor] = React.useState('');
    // const [projectName, setProjectName] = React.useState('');
    // const [pointsImage, setPointsImage] = React.useState('');

    // const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setTitle(e.target.value);
    // };

    // const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setSubtitle(e.target.value);
    // };

    // const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setDescription(e.target.value);
    // };

    // const handleInnerDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setInnerDescription(e.target.value);
    // };

    // const handleBoxImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setBoxImage(e.target.value);
    // };

    // const handleBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setBgImage(e.target.value);
    // };

    // const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setProfileImage(e.target.value);
    // };

    // const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setColor(e.target.value);
    // };

    // const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setProjectName(e.target.value);
    // };

    // const handlePointsImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setPointsImage(e.target.value);
    // };

        // let campaign = {
        //     title: e.target.elements[0].value,
        //     subtitle: e.target.elements[2].value,
        //         part1: e.target.elements[4].value,
        //         main: e.target.elements[6].value,
        //         part2: e.target.elements[8].value,
        //     inner_description: e.target.elements[10].value,
        //     box_image: e.target.elements[12].value,
        //     bg_image: e.target.elements[14].value,
        //     profile_image: e.target.elements[16].value,
        //     color: e.target.elements[18].value,
        //     points_image: e.target.elements[20].value,
        //     project_name: e.target.elements[22].value,
        // };
        createCampaign(
            e.target.elements[0].value,
            e.target.elements[2].value,
            e.target.elements[4].value,
            e.target.elements[6].value,
            e.target.elements[8].value,
            e.target.elements[10].value,
            e.target.elements[12].value,
            e.target.elements[14].value,
            e.target.elements[16].value,
            e.target.elements[18].value,
            e.target.elements[22].value,
            e.target.elements[20].value,
        ).then(campaign => {
            console.log('Campaign Created:', campaign);
            setSuccess(true);
            setMessage('Campaign Created');
        }).catch(err => {
            console.log(err);
            setError(true);
            setMessage('Campaign Creation Failed');
        });
    };

  const handleCreateQuests = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Create Quests Clicked");
    const fieldsJson = JSON.stringify(fields);

    console.log(fieldsJson);
    // Console.log('Title:', e.target.elements[0].value);
    // console.log('Description:', e.target.elements[2].value);
    // console.log('Display Image:', e.target.elements[4].value);
    // console.log('Tasks:', fields.toString());
    // console.log('Reward Collection Name:', e.target.elements[34].value);
    // console.log('Reward Amount:', e.target.elements[36].value);
    // console.log('Reward Method:', e.target.elements[38].value);
    // console.log('Expires On:', e.target.elements[40].value);
    // console.log('Created On:', e.target.elements[42].value);
    // console.log('Campaign ID:', e.target.elements[44].value);
    const time = new Date();
    // Console.log('Title:', e.target.elements);
    createQuest(
      e.target.elements[0].value,
      e.target.elements[2].value,
      e.target.elements[4].value,
      fieldsJson.toString(),
      e.target.elements[21].value,
      e.target.elements[23].value,
      e.target.elements[25].value,
      time,
      time,
      e.target.elements[31].value
    )
      .then((quest) => {
        console.log("Quest Created:", quest);
        setSuccess(true);
        setMessage("Quest Created");
      })
      .catch((err) => {
        console.log(err);
        setError(true);
        setMessage("Quest Creation Failed");
      });
  };

        

  return (
    <Layout>
      <ErrorAlert
        errorAlert={error}
        setErrorAlert={setError}
        message={message}
      />
      <SuccessAlert
        successAlert={success}
        setSuccessAlert={setSuccess}
        message={message}
      />
      <SideMenu />
      <mui.Box marginLeft='10%'>
        <h1 style={{ color: "white" }}>Create Campaign</h1>
        <form
          style={{ backgroundColor: "white" }}
          onSubmit={handleCreateCampaign}
        >
          <mui.TextField label='Title' />
          <mui.TextField label='Sub title' />
          <mui.TextField label='Desc' />
          <mui.TextField label='DescMain' />
          <mui.TextField label='DescSec' />
          <mui.TextField label='DescInner' />
          <mui.TextField label='Box URL' />
          <mui.TextField label='BG URL' />
          <mui.TextField label='Profile URL' />
          <mui.TextField label='Color' />
          <mui.TextField label='Project Title' />
          <mui.TextField label='Points URL' />

          <mui.Button type='submit'>Submit</mui.Button>
        </form>
      </mui.Box>

      <mui.Box marginLeft='10%'>
        <h1 style={{ color: "white" }}>Create Quests</h1>
        <form
          style={{ backgroundColor: "white" }}
          onSubmit={handleCreateQuests}
        >
          <mui.TextField label='Title' />
          <mui.TextField label='Description' />
          <mui.TextField label='Display Image' />

          {/* Dynamic fields */}
          <h4>Tasks</h4>
          {fields.map((field, index) => (
            <div key={index}>
              <mui.TextField
                label='Task Name'
                value={field.title}
                onChange={(e) => {
                  handleFieldChange(index, "title", e.target.value);
                }}
              />
              <mui.TextField
                label='Description'
                value={field.description}
                onChange={(e) => {
                  handleFieldChange(index, "description", e.target.value);
                }}
              />
              <mui.TextField
                label='Transaction'
                value={field.transaction}
                onChange={(e) => {
                  handleFieldChange(index, "transaction", e.target.value);
                }}
              />
              <mui.TextField
                label='Program ID'
                value={field.program_id}
                onChange={(e) => {
                  handleFieldChange(index, "program_id", e.target.value);
                }}
              />
              <mui.TextField
                label='Function ID'
                value={field.function_id}
                onChange={(e) => {
                  handleFieldChange(index, "function_id", e.target.value);
                }}
              />
              <mui.TextField
                label='Dapp URL'
                value={field.dapp_url}
                onChange={(e) => {
                  handleFieldChange(index, "dapp_url", e.target.value);
                }}
              />
              <mui.TextField
                label='Points'
                value={field.points}
                onChange={(e) => {
                  handleFieldChange(index, "points", e.target.value);
                }}
              />
            </div>
          ))}

          <mui.Button type='button' onClick={handleAddField}>
            Add Field
          </mui.Button>
          <br></br>
          <h4>Reward Mechanism</h4>
          <mui.TextField label='Reward Collection Name' />
          <mui.TextField label='Reward Amount' />
          <mui.Select label='Reward Method'>
            <mui.MenuItem value='FCFS'> FCFS</mui.MenuItem>
            <mui.MenuItem value='LeaderBoard'>LeaderBoard</mui.MenuItem>
            <mui.MenuItem value='LuckyDraw'>LuckyDraw</mui.MenuItem>
          </mui.Select>
          <mui.TextField
            label='Expires On'
            type='date'
            InputLabelProps={{ shrink: true }}
          />
          <mui.TextField label='Created On' />
          <mui.TextField label='Campaign ID' />

          <mui.Button type='submit'>Submit</mui.Button>
        </form>
      </mui.Box>
    </Layout>
  );
};

export default TestQaaS;
