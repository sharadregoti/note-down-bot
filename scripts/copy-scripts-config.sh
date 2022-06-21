#!/bin/bash
scp -r -i "../../aws/Access-Key-On-Notion.pem" scripts ec2-user@ec2-43-204-20-55.ap-south-1.compute.amazonaws.com:/home/ec2-user
scp -r -i "../../aws/Access-Key-On-Notion.pem" deployment ec2-user@ec2-43-204-20-55.ap-south-1.compute.amazonaws.com:/home/ec2-user
