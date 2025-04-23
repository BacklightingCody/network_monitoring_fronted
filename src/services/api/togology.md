import { Controller, Get, Query, Param, HttpException, HttpStatus } from '@nestjs/common';
import { TopologyService } from './topology.service';
import { NodeDetails, TopologyData } from './dto/topology.dto';

@Controller('topology')
export class TopologyController {
  constructor(private readonly topologyService: TopologyService) {}

  /**
   * 获取网络拓扑图数据
   * @param startTime 开始时间（可选）
   * @param endTime 结束时间（可选）
   * @returns 网络拓扑数据
   */
  @Get()
  async getNetworkTopology(
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ): Promise<TopologyData> {
    try {
      const timeRange = this.getTimeRange(startTime, endTime);
      return await this.topologyService.getNetworkTopology(timeRange);
    } catch (error) {
      console.error('获取网络拓扑图失败:', error);
      throw new HttpException(
        `获取网络拓扑图失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取节点详细信息
   * @param nodeId 节点ID（IP地址）
   * @param startTime 开始时间（可选）
   * @param endTime 结束时间（可选）
   * @returns 节点详细信息
   */
  @Get('node/:nodeId')
  async getNodeDetails(
    @Param('nodeId') nodeId: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ): Promise<NodeDetails> {
    try {
      if (!nodeId) {
        throw new HttpException(
          '节点ID不能为空',
          HttpStatus.BAD_REQUEST,
        );
      }
      
      const timeRange = this.getTimeRange(startTime, endTime);
      return await this.topologyService.getNodeDetails(nodeId, timeRange);
    } catch (error) {
      console.error(`获取节点 ${nodeId} 详情失败:`, error);
      throw new HttpException(
        `获取节点详情失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 辅助方法：解析时间范围
   * @param startTime 开始时间字符串
   * @param endTime 结束时间字符串
   * @returns 时间范围对象或undefined
   */
  private getTimeRange(startTime?: string, endTime?: string) {
    if (!startTime && !endTime) return undefined;
    
    const timeRange: any = {};
    if (startTime) timeRange.start = new Date(startTime);
    if (endTime) timeRange.end = new Date(endTime);
    return timeRange;
  }
} 

这个对应到后端是getNetworkTopology
{
  "code": 0,
  "data": {
    "nodes": [
      {
        "id": "009d",
        "name": "009d",
        "value": 2,
        "type": "external",
        "category": 1,
        "packetsSent": 2,
        "packetsReceived": 0,
        "totalBytesSent": 0,
        "totalBytesReceived": 0,
        "protocols": {
          "1302": 2
        },
        "mainProtocol": "1302"
      },
      {
        "id": "1301",
        "name": "1301",
        "value": 2,
        "type": "external",
        "category": 1,
        "packetsSent": 0,
        "packetsReceived": 2,
        "totalBytesSent": 0,
        "totalBytesReceived": 0,
        "protocols": {
          "1302": 2
        },
        "mainProtocol": "1302"
      },
      {
        "id": "29-23-24",
        "name": "29-23-24",
        "value": 1,
        "type": "external",
        "category": 1,
        "packetsSent": 1,
        "packetsReceived": 0,
        "totalBytesSent": 0,
        "totalBytesReceived": 0,
        "protocols": {
          "UNKNOWN": 1
        },
        "mainProtocol": "UNKNOWN"
      },
      {
        "id": "0\"",
        "name": "0\"",
        "value": 2,
        "type": "external",
        "category": 1,
        "packetsSent": 0,
        "packetsReceived": 2,
        "totalBytesSent": 0,
        "totalBytesReceived": 0,
        "protocols": {
          "UNKNOWN": 2
        },
        "mainProtocol": "UNKNOWN"
      },
      {
        "id": "4588-29-23-24",
        "name": "4588-29-23-24",
        "value": 1,
        "type": "external",
        "category": 1,
        "packetsSent": 1,
        "packetsReceived": 0,
        "totalBytesSent": 0,
        "totalBytesReceived": 0,
        "protocols": {
          "UNKNOWN": 1
        },
        "mainProtocol": "UNKNOWN"
      },
      {
        "id": "192.168.1.13",
        "name": "192.168.1.13",
        "value": 31,
        "type": "internal",
        "category": 0,
        "packetsSent": 14,
        "packetsReceived": 17,
        "totalBytesSent": 3159,
        "totalBytesReceived": 8516,
        "protocols": {
          "TCP": 30,
          "NBNS": 1
        },
        "mainProtocol": "TCP"
      },
      {
        "id": "20.189.173.6",
        "name": "20.189.173.6",
        "value": 3,
        "type": "external",
        "category": 1,
        "packetsSent": 1,
        "packetsReceived": 2,
        "totalBytesSent": 54,
        "totalBytesReceived": 108,
        "protocols": {
          "TCP": 3
        },
        "mainProtocol": "TCP"
      },
      {
        "id": "120.241.254.165",
        "name": "120.241.254.165",
        "value": 22,
        "type": "external",
        "category": 1,
        "packetsSent": 13,
        "packetsReceived": 9,
        "totalBytesSent": 8280,
        "totalBytesReceived": 2839,
        "protocols": {
          "TCP": 22
        },
        "mainProtocol": "TCP"
      },
      {
        "id": "120.241.254.171",
        "name": "120.241.254.171",
        "value": 1,
        "type": "external",
        "category": 1,
        "packetsSent": 1,
        "packetsReceived": 0,
        "totalBytesSent": 54,
        "totalBytesReceived": 0,
        "protocols": {
          "TCP": 1
        },
        "mainProtocol": "TCP"
      },
      {
        "id": "36.151.177.28",
        "name": "36.151.177.28",
        "value": 4,
        "type": "external",
        "category": 1,
        "packetsSent": 2,
        "packetsReceived": 2,
        "totalBytesSent": 128,
        "totalBytesReceived": 120,
        "protocols": {
          "TCP": 4
        },
        "mainProtocol": "TCP"
      },
      {
        "id": "192.168.1.255",
        "name": "192.168.1.255",
        "value": 1,
        "type": "internal",
        "category": 0,
        "packetsSent": 0,
        "packetsReceived": 1,
        "totalBytesSent": 0,
        "totalBytesReceived": 92,
        "protocols": {
          "NBNS": 1
        },
        "mainProtocol": "NBNS"
      },
      {
        "id": "fe80::5626:6458:9d6e:8eda",
        "name": "fe80::5626:6458:9d6e:8eda",
        "value": 1,
        "type": "external",
        "category": 1,
        "packetsSent": 1,
        "packetsReceived": 0,
        "totalBytesSent": 98,
        "totalBytesReceived": 0,
        "protocols": {
          "DNS": 1
        },
        "mainProtocol": "DNS"
      },
      {
        "id": "fe80::1",
        "name": "fe80::1",
        "value": 1,
        "type": "external",
        "category": 1,
        "packetsSent": 0,
        "packetsReceived": 1,
        "totalBytesSent": 0,
        "totalBytesReceived": 98,
        "protocols": {
          "DNS": 1
        },
        "mainProtocol": "DNS"
      }
    ],
    "links": [
      {
        "source": "009d",
        "target": "1301",
        "value": 2,
        "protocol": "1302",
        "packets": 2,
        "bytes": 0
      },
      {
        "source": "29-23-24",
        "target": "0\"",
        "value": 1,
        "protocol": "UNKNOWN",
        "packets": 1,
        "bytes": 0
      },
      {
        "source": "4588-29-23-24",
        "target": "0\"",
        "value": 1,
        "protocol": "UNKNOWN",
        "packets": 1,
        "bytes": 0
      },
      {
        "source": "192.168.1.13",
        "target": "20.189.173.6",
        "value": 2,
        "protocol": "TCP",
        "packets": 2,
        "bytes": 108
      },
      {
        "source": "120.241.254.165",
        "target": "192.168.1.13",
        "value": 13,
        "protocol": "TCP",
        "packets": 13,
        "bytes": 8280
      },
      {
        "source": "192.168.1.13",
        "target": "120.241.254.165",
        "value": 9,
        "protocol": "TCP",
        "packets": 9,
        "bytes": 2839
      },
      {
        "source": "20.189.173.6",
        "target": "192.168.1.13",
        "value": 1,
        "protocol": "TCP",
        "packets": 1,
        "bytes": 54
      },
      {
        "source": "120.241.254.171",
        "target": "192.168.1.13",
        "value": 1,
        "protocol": "TCP",
        "packets": 1,
        "bytes": 54
      },
      {
        "source": "192.168.1.13",
        "target": "36.151.177.28",
        "value": 2,
        "protocol": "TCP",
        "packets": 2,
        "bytes": 120
      },
      {
        "source": "36.151.177.28",
        "target": "192.168.1.13",
        "value": 2,
        "protocol": "TCP",
        "packets": 2,
        "bytes": 128
      },
      {
        "source": "192.168.1.13",
        "target": "192.168.1.255",
        "value": 1,
        "protocol": "NBNS",
        "packets": 1,
        "bytes": 92
      },
      {
        "source": "fe80::5626:6458:9d6e:8eda",
        "target": "fe80::1",
        "value": 1,
        "protocol": "DNS",
        "packets": 1,
        "bytes": 98
      }
    ],
    "summary": {
      "nodeCount": 13,
      "linkCount": 12,
      "internalNodes": 2,
      "externalNodes": 11,
      "totalPackets": 5000
    }
  },
  "message": "成功"
}
下面的是/togology/node/:nodeId
{"code":0,"data":{"nodeId":"192.168.1.13","totalPacketsSent":1000,"totalPacketsReceived":1000,"totalBytesSent":184481,"totalBytesReceived":659145,"connectedNodes":[{"ip":"20.189.173.6","packetsSent":6,"packetsReceived":4,"totalBytes":1132},{"ip":"120.241.254.165","packetsSent":75,"packetsReceived":87,"totalBytes":66650},{"ip":"36.151.177.28","packetsSent":17,"packetsReceived":10,"totalBytes":4384},{"ip":"192.168.1.255","packetsSent":3,"packetsReceived":0,"totalBytes":276},{"ip":"120.241.254.171","packetsSent":1,"packetsReceived":1,"totalBytes":108},{"ip":"104.16.132.229","packetsSent":32,"packetsReceived":43,"totalBytes":7994},{"ip":"120.53.53.53","packetsSent":39,"packetsReceived":36,"totalBytes":9515},{"ip":"103.121.210.210","packetsSent":9,"packetsReceived":0,"totalBytes":594},{"ip":"101.101.101.101","packetsSent":9,"packetsReceived":0,"totalBytes":594},{"ip":"117.168.151.122","packetsSent":30,"packetsReceived":28,"totalBytes":20796},{"ip":"223.5.5.5","packetsSent":34,"packetsReceived":46,"totalBytes":10402},{"ip":"8.8.4.4","packetsSent":9,"packetsReceived":0,"totalBytes":594},{"ip":"203.2.166.83","packetsSent":121,"packetsReceived":128,"totalBytes":197820},{"ip":"183.194.190.28","packetsSent":16,"packetsReceived":16,"totalBytes":11001},{"ip":"36.151.195.28","packetsSent":68,"packetsReceived":91,"totalBytes":52270},{"ip":"50.17.112.244","packetsSent":7,"packetsReceived":0,"totalBytes":9058},{"ip":"52.21.180.129","packetsSent":2,"packetsReceived":2,"totalBytes":264},{"ip":"52.0.212.240","packetsSent":4,"packetsReceived":6,"totalBytes":636},{"ip":"44.218.207.244","packetsSent":17,"packetsReceived":17,"totalBytes":3288},{"ip":"54.161.182.44","packetsSent":4,"packetsReceived":12,"totalBytes":1056},{"ip":"3.227.202.252","packetsSent":2,"packetsReceived":6,"totalBytes":516},{"ip":"52.7.103.10","packetsSent":6,"packetsReceived":0,"totalBytes":2454},{"ip":"54.172.250.201","packetsSent":4,"packetsReceived":10,"totalBytes":924},{"ip":"3.211.162.40","packetsSent":3,"packetsReceived":7,"totalBytes":660},{"ip":"3.220.75.19","packetsSent":9,"packetsReceived":4,"totalBytes":1279},{"ip":"34.205.241.122","packetsSent":1,"packetsReceived":1,"totalBytes":132},{"ip":"174.129.134.98","packetsSent":1,"packetsReceived":1,"totalBytes":132},{"ip":"54.236.144.31","packetsSent":1,"packetsReceived":1,"totalBytes":132},{"ip":"44.207.96.59","packetsSent":1,"packetsReceived":1,"totalBytes":132},{"ip":"117.172.176.70","packetsSent":6,"packetsReceived":5,"totalBytes":2492},{"ip":"44.199.156.251","packetsSent":1,"packetsReceived":0,"totalBytes":66},{"ip":"173.194.174.188","packetsSent":11,"packetsReceived":14,"totalBytes":11547},{"ip":"146.75.47.10","packetsSent":11,"packetsReceived":9,"totalBytes":4039},{"ip":"54.157.14.240","packetsSent":151,"packetsReceived":208,"totalBytes":305487},{"ip":"74.125.23.84","packetsSent":4,"packetsReceived":0,"totalBytes":264},{"ip":"202.89.233.101","packetsSent":17,"packetsReceived":13,"totalBytes":14479},{"ip":"34.234.107.113","packetsSent":2,"packetsReceived":4,"totalBytes":396},{"ip":"54.90.11.175","packetsSent":2,"packetsReceived":7,"totalBytes":594},{"ip":"142.250.204.42","packetsSent":25,"packetsReceived":0,"totalBytes":1650},{"ip":"54.167.164.79","packetsSent":2,"packetsReceived":6,"totalBytes":528},{"ip":"142.250.198.74","packetsSent":38,"packetsReceived":0,"totalBytes":2508},{"ip":"52.207.50.16","packetsSent":2,"packetsReceived":7,"totalBytes":594},{"ip":"54.172.238.214","packetsSent":2,"packetsReceived":6,"totalBytes":528},{"ip":"18.232.20.167","packetsSent":27,"packetsReceived":25,"totalBytes":17354},{"ip":"104.26.4.201","packetsSent":21,"packetsReceived":17,"totalBytes":4064},{"ip":"52.86.211.195","packetsSent":30,"packetsReceived":30,"totalBytes":21993},{"ip":"142.250.196.202","packetsSent":15,"packetsReceived":0,"totalBytes":990},{"ip":"120.253.253.161","packetsSent":12,"packetsReceived":6,"totalBytes":1035},{"ip":"120.253.255.34","packetsSent":30,"packetsReceived":16,"totalBytes":24588},{"ip":"111.48.119.197","packetsSent":1,"packetsReceived":2,"totalBytes":176},{"ip":"23.42.70.18","packetsSent":12,"packetsReceived":9,"totalBytes":3365},{"ip":"239.192.152.143","packetsSent":3,"packetsReceived":0,"totalBytes":534},{"ip":"142.250.77.10","packetsSent":18,"packetsReceived":0,"totalBytes":1188},{"ip":"142.250.204.46","packetsSent":11,"packetsReceived":0,"totalBytes":726},{"ip":"224.0.0.251","packetsSent":3,"packetsReceived":0,"totalBytes":246},{"ip":"239.255.255.250","packetsSent":1,"packetsReceived":0,"totalBytes":179},{"ip":"75.126.115.192","packetsSent":8,"packetsReceived":0,"totalBytes":528},{"ip":"44.209.218.68","packetsSent":1,"packetsReceived":5,"totalBytes":396},{"ip":"52.70.132.246","packetsSent":1,"packetsReceived":4,"totalBytes":330},{"ip":"1.12.12.21","packetsSent":1,"packetsReceived":13,"totalBytes":2725},{"ip":"192.168.1.3","packetsSent":0,"packetsReceived":1,"totalBytes":325},{"ip":"44.210.248.109","packetsSent":0,"packetsReceived":6,"totalBytes":396},{"ip":"34.235.251.167","packetsSent":0,"packetsReceived":5,"totalBytes":2101},{"ip":"54.146.46.218","packetsSent":0,"packetsReceived":3,"totalBytes":198},{"ip":"34.198.242.163","packetsSent":0,"packetsReceived":11,"totalBytes":5579},{"ip":"183.236.51.78","packetsSent":0,"packetsReceived":10,"totalBytes":4645}],"protocolDistribution":[{"protocol":"TCP","count":1542,"percentage":77.10000000000001},{"protocol":"NBNS","count":3,"percentage":0.15},{"protocol":"TLSV1.3","count":55,"percentage":2.75},{"protocol":"TLSV1.2","count":320,"percentage":16},{"protocol":"SSL","count":19,"percentage":0.95},{"protocol":"HTTP","count":45,"percentage":2.25},{"protocol":"LSD","count":3,"percentage":0.15},{"protocol":"QUIC","count":6,"percentage":0.3},{"protocol":"MDNS","count":3,"percentage":0.15},{"protocol":"SSDP","count":2,"percentage":0.1},{"protocol":"ICMP","count":2,"percentage":0.1}],"trafficTrend":[{"time":"2025-04-19 16:00","packets":992,"bytes":390115},{"time":"2025-04-20 13:00","packets":1008,"bytes":453511}]},"message":"成功"}
Quick Actions