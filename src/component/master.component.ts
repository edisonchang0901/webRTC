import { Component, ViewChild, ElementRef } from '@angular/core';
import {
  KinesisVideoClient,
  GetSignalingChannelEndpointCommand
} from '@aws-sdk/client-kinesis-video';

import {
  KinesisVideoSignalingClient,
  GetIceServerConfigCommand
} from '@aws-sdk/client-kinesis-video-signaling';

import {environment} from '../app/environments/environment.dev';
import { SignalingClient, Role } from 'amazon-kinesis-video-streams-webrtc';

@Component({
  selector: 'app-master',
  standalone: true,
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss']
})
export class MasterComponent {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

   async onclickMaster()
  {
    const channelARN = environment.channelarn;
    console.log('channelARN :', channelARN)
    const accessKeyId = environment.accesskeyId;
    console.log('accessKeyId :', accessKeyId)
    const secretAccessKey = environment.secretAccessKey;
    console.log('secretAccessKey :', secretAccessKey)
    const region = environment.region;
    console.log('region :', region)

    const kinesisVideoClient = new KinesisVideoClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });


    const endpointCommand = new GetSignalingChannelEndpointCommand({
      ChannelARN: environment.channelarn,
      SingleMasterChannelEndpointConfiguration: {
      Protocols: ['WSS', 'HTTPS'],
      Role: 'MASTER',
     }
    });

    // Get the signaling Https與Wss endpoint
    const endpointResponse = await kinesisVideoClient.send(endpointCommand);

    const httpsEndpoint = endpointResponse.ResourceEndpointList?.find(x => x.Protocol === 'HTTPS')?.ResourceEndpoint;
    const wssEndpoint = endpointResponse.ResourceEndpointList?.find(x => x.Protocol === 'WSS')?.ResourceEndpoint;

    console.log('httpsEndpoint :', httpsEndpoint);
    console.log('wssEndpoint :', wssEndpoint);

    const kinesisVideoSignalingClient = new KinesisVideoSignalingClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      },
      endpoint: httpsEndpoint
    });

    const iceCommand = new GetIceServerConfigCommand({
      ChannelARN: channelARN
    });

     const iceResponse = await kinesisVideoSignalingClient.send(iceCommand);
     const iceServers: RTCIceServer[] = [
        {
          urls: `stun:stun.kinesisvideo.${region}.amazonaws.com:443`,
        },
     ];

     const peerConnection = new RTCPeerConnection({ iceServers });

     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });






  }
}

