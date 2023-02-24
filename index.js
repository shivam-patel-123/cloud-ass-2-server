const express = require("express");
const axios = require("axios");
const fs = require("fs");
const AWS = require("aws-sdk");
require("dotenv").config();

const app = express();
AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    sessionToken: process.env.SESSION_TOKEN,
});

const s3 = new AWS.S3();

app.use(express.json());
const PORT = 5000;

const banner = "B00917152";
const ip = `localhost:${PORT}`;
const robIP = "52.91.127.198:8080";

let data;

(async function () {
    data = await axios.post(`http://${robIP}/start`, {
        banner,
        ip,
    });
    console.log(data);
})();

app.post("/storedata", async (req, res) => {
    const data2 = req.body.data;

    s3.upload(
        {
            Bucket: "csci-5409-assig-2-b00917152",
            Key: "data.txt",
            Body: data2,
        },
        (err, data) => {
            if (err) {
                console.log(err);
                return;
            }

            res.status(200).json({
                s3uri: data.Location,
            });
        }
    );
});

app.post("/appenddata", (req, res) => {
    const { data: updatedData } = req.body;

    s3.getObject(
        {
            Bucket: "csci-5409-assig-2-b00917152",
            Key: "data.txt",
        },
        (err, prevData) => {
            if (err) {
                console.log(err);
                return;
            }

            s3.upload(
                {
                    Bucket: "csci-5409-assig-2-b00917152",
                    Key: "data.txt",
                    Body: `${prevData.Body.toString()}${updatedData}`,
                },
                (err, data) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    res.sendStatus(200);
                }
            );
        }
    );
});

app.post("/deletefile", (req, res) => {
    const { s3uri } = req.body;

    const key = s3uri.split("/")[3];
    const bucketName = s3uri.split("/")[2].split(".")[0];

    console.log(key);
    console.log(bucketName);

    s3.deleteObject(
        {
            Key: key,
            Bucket: bucketName,
        },
        (err, data) => {
            if (err) {
                console.log(err);
            }

            res.sendStatus(200);
        }
    );
});

app.listen(PORT, () => {
    console.log("My server is running on port : 5000");
});
