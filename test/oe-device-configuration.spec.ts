import * as chai from "chai";
import "url-search-params-polyfill";
import { MindSphereSdk } from "../src";
import { DeviceConfigurationModels } from "../src/api/sdk/open-edge/open-edge-models";
import { decrypt, loadAuth } from "../src/api/utils";
import { setupDeviceTestStructure, tearDownDeviceTestStructure } from "./test-device-setup-utils";
import { getPasskeyForUnitTest, sleep } from "./test-utils";
chai.should();

const timeOffset = new Date().getTime();
describe("[SDK] DeviceManagementClient.DeviceConfiguration", () => {
    const auth = loadAuth();
    const sdk = new MindSphereSdk({
        ...auth,
        basicAuth: decrypt(auth, getPasskeyForUnitTest()),
    });
    const deviceConfigurationClient = sdk.GetDeviceConfigurationClient();
    const tenant = sdk.GetTenant();

    const configFileTemplate = {
        path: `/${tenant}/TEST/${timeOffset}/TEST_DEVICE_CONFIGURATION.json`,
        description: `Configuration for test the API. generated by ${tenant} on ${new Date()}`,
    };

    const testConfigurationTask = {
        files: [
            {
                name: configFileTemplate.path,
                uri: `https://testuri.com/${tenant}/TEST/${timeOffset}/TEST_DEVICE_CONFIGURATION.json`,
                checksum: "sha1:cf23...",
            },
        ],
        customData: {
            name: "TEST_DEVICE_CONFIGURATION",
            sampleKey1: "sampleValue1",
            sampleKey2: "sampleValue2",
            created: timeOffset,
        },
        target: {
            address: "XTOOLS",
        },
    };

    const testConfigurationState = {
        state: DeviceConfigurationModels.Updatetask.StateEnum.CONFIGURING,
        progress: 0,
        message: "Configuring.",
        details: {},
    };

    let deviceTypeId = "aee2e37f-f562-4ed6-b90a-c43208dc054a";
    let assetTypeId = `${tenant}.UnitTestDeviceAssetType`;
    let assetId = "";
    let gFolderid = "";

    let deviceId = "";
    let configTaskId = "";
    let globalFileId = "";
    let globalFilePath = "";

    before(async () => {
        // tear Down test infrastructure
        await deleteFiles();
        await tearDownDeviceTestStructure(sdk);

        // Setup the testing architecture
        const { device, deviceAsset, deviceType, deviceAssetType, folderid } = await setupDeviceTestStructure(sdk);
        assetTypeId = `${(deviceAssetType as any).id}`;
        deviceTypeId = `${(deviceType as any).id}`;
        assetId = `${(deviceAsset as any).assetId}`;
        deviceId = `${(device as any).id}`;
        gFolderid = `${folderid}`;

        // Post a new file config
        const newFile = await deviceConfigurationClient.PostNewFile(configFileTemplate);
        globalFileId = `${(newFile as any).id}`;
        globalFilePath = `${(newFile as any).path}`;
    });

    after(async () => {
        // Cancel all configuration tasks
        // await CancelAllGeneratedConfigurationTaks();
        // delete all generated files
        await deleteFiles();

        // tear Down test infrastructure
        await tearDownDeviceTestStructure(sdk);
    });

    it("SDK should not be undefined", async () => {
        sdk.should.not.be.undefined;
    });

    it("standard properties shoud be defined", async () => {
        deviceConfigurationClient.should.not.be.undefined;
        deviceConfigurationClient.GetGateway().should.be.equal(auth.gateway);
        (await deviceConfigurationClient.GetToken()).length.should.be.greaterThan(200);
        (await deviceConfigurationClient.GetToken()).length.should.be.greaterThan(200);
    });

    it("should POST to create a new empty file", async () => {
        deviceConfigurationClient.should.not.be.undefined;

        // Prepare the template
        const _configFileTemplate = {
            path: `/${tenant}/TEST/${timeOffset}/TEST_DEVICE_CONFIGURATION_A.json`,
            description: `Configuration for test the API. generated by ${tenant} on ${new Date()}`,
        };

        const newFile = await deviceConfigurationClient.PostNewFile(_configFileTemplate);

        newFile.should.not.be.undefined;
        newFile.should.not.be.null;
        (newFile as any).id.should.not.be.undefined;
        (newFile as any).id.should.not.be.null;
        (newFile as any).path.should.not.be.undefined;
        (newFile as any).path.should.not.be.null;

        // delete file
        await deviceConfigurationClient.DeleteFile((newFile as any).id);
    });

    it("should POST to create a new empty file and add content revision of 1b.", async () => {
        deviceConfigurationClient.should.not.be.undefined;

        // Prepare the template
        const _configFileTemplate = {
            path: `/${tenant}/TEST/${timeOffset}/TEST_DEVICE_CONFIGURATION_B.json`,
            description: `Configuration for test the API. generated by ${tenant} on ${new Date()}`,
        };

        const newFile = await deviceConfigurationClient.PostNewFile(_configFileTemplate);

        newFile.should.not.be.undefined;
        newFile.should.not.be.null;
        (newFile as any).id.should.not.be.undefined;
        (newFile as any).id.should.not.be.null;
        (newFile as any).path.should.not.be.undefined;
        (newFile as any).path.should.not.be.null;

        const _fileId = (newFile as any).id;

        // post content of 1kb
        const buffer = Buffer.alloc(1);
        const revision = await deviceConfigurationClient.PostFileRevision(_fileId, buffer);
        (revision as any).fileId.should.not.be.undefined;
        (revision as any).fileId.should.not.be.null;
        (revision as any).contentType.should.not.be.undefined;
        (revision as any).contentType.should.not.be.null;

        // delete file
        await deviceConfigurationClient.DeleteFile((newFile as any).id);
    });

    it("should POST to create a new empty file and add content revision of 8Mb.", async () => {
        deviceConfigurationClient.should.not.be.undefined;

        // Prepare the template
        const _configFileTemplate = {
            path: `/${tenant}/TEST/${timeOffset}/TEST_DEVICE_CONFIGURATION_C.json`,
            description: `Configuration for test the API. generated by ${tenant} on ${new Date()}`,
        };

        const newFile = await deviceConfigurationClient.PostNewFile(_configFileTemplate);

        newFile.should.not.be.undefined;
        newFile.should.not.be.null;
        (newFile as any).id.should.not.be.undefined;
        (newFile as any).id.should.not.be.null;
        (newFile as any).path.should.not.be.undefined;
        (newFile as any).path.should.not.be.null;

        const _fileId = (newFile as any).id;

        // post content of 1kb
        const buffer = Buffer.alloc(8 * 1024 * 1024);
        const revision = await deviceConfigurationClient.PostFileRevision(_fileId, buffer);
        (revision as any).fileId.should.not.be.undefined;
        (revision as any).fileId.should.not.be.null;
        (revision as any).contentType.should.not.be.undefined;
        (revision as any).contentType.should.not.be.null;

        // delete file
        await deviceConfigurationClient.DeleteFile((newFile as any).id);
    });

    it("should POST to create a new empty file and add content revision of 16Mb.", async () => {
        deviceConfigurationClient.should.not.be.undefined;

        // Prepare the template
        const _configFileTemplate = {
            path: `/${tenant}/TEST/${timeOffset}/TEST_DEVICE_CONFIGURATION_D.json`,
            description: `Configuration for test the API. generated by ${tenant} on ${new Date()}`,
        };

        const newFile = await deviceConfigurationClient.PostNewFile(_configFileTemplate);

        newFile.should.not.be.undefined;
        newFile.should.not.be.null;
        (newFile as any).id.should.not.be.undefined;
        (newFile as any).id.should.not.be.null;
        (newFile as any).path.should.not.be.undefined;
        (newFile as any).path.should.not.be.null;

        const _fileId = (newFile as any).id;

        // post content of 1kb
        const buffer = Buffer.alloc(16 * 1024 * 1024);
        const revision = await deviceConfigurationClient.PostFileRevision(_fileId, buffer);
        (revision as any).fileId.should.not.be.undefined;
        (revision as any).fileId.should.not.be.null;
        (revision as any).contentType.should.not.be.undefined;
        (revision as any).contentType.should.not.be.null;

        // delete file
        await deviceConfigurationClient.DeleteFile((newFile as any).id);
    });

    it("should POST to add content revision of 1Mb.", async () => {
        deviceConfigurationClient.should.not.be.undefined;

        // post content of 1kb
        const buffer = Buffer.alloc(1 * 1024 * 1024);
        const revision = await deviceConfigurationClient.PostFileRevision(globalFileId, buffer);
        (revision as any).fileId.should.not.be.undefined;
        (revision as any).fileId.should.not.be.null;
        (revision as any).contentType.should.not.be.undefined;
        (revision as any).contentType.should.not.be.null;
    });

    // it("should PATCH to Update head to new revision of 2Mb.", async () => {
    //     deviceConfigurationClient.should.not.be.undefined;
    //
    //     // post content of 1kb
    //     const buffer = Buffer.alloc(2 * 1024 * 1024);
    //     const revision = await deviceConfigurationClient.PatchFileHead(globalFileId, buffer);
    //     (revision as any).fileId.should.not.be.undefined;
    //     (revision as any).fileId.should.not.be.null;
    //     (revision as any).contentType.should.not.be.undefined;
    //     (revision as any).contentType.should.not.be.null;
    // });

    it("should GET to list all files revisions.", async () => {
        deviceConfigurationClient.should.not.be.undefined;

        const revisions = await deviceConfigurationClient.GetFileRevisions(globalFileId);
        (revisions as any).should.not.be.undefined;
        (revisions as any).should.not.be.null;
        (revisions as any).page.number.should.equal(0);
        (revisions as any).page.size.should.be.gte(10);
        (revisions as any).content.length.should.be.gte(0);
    });

    it("should GET to list all files from path.", async () => {
        deviceConfigurationClient.should.not.be.undefined;

        const files = await deviceConfigurationClient.GetFiles(`/${tenant}/TEST/${timeOffset}/`);
        (files as any).should.not.be.undefined;
        (files as any).should.not.be.null;
        (files as any).page.number.should.equal(0);
        (files as any).page.size.should.be.gte(10);
        (files as any).content.length.should.be.gte(0);
    });

    it("should GET file meta data.", async () => {
        deviceConfigurationClient.should.not.be.undefined;

        const fileMetaData = await deviceConfigurationClient.GetFileMetadata(globalFileId);
        (fileMetaData as any).should.not.be.undefined;
        (fileMetaData as any).should.not.be.null;
        (fileMetaData as any).id.should.not.be.undefined;
        (fileMetaData as any).id.should.not.be.null;
        (fileMetaData as any).path.should.not.be.undefined;
        (fileMetaData as any).path.should.not.be.null;
    });

    it("should GET file revision meta data.", async () => {
        deviceConfigurationClient.should.not.be.undefined;

        // Prepare the template
        const _configFileTemplate = {
            path: `/${tenant}/TEST/${timeOffset}/TEST_DEVICE_CONFIGURATION_E.json`,
            description: `Configuration for test the API. generated by ${tenant} on ${new Date()}`,
        };

        const newFile = await deviceConfigurationClient.PostNewFile(_configFileTemplate);

        newFile.should.not.be.undefined;
        newFile.should.not.be.null;
        (newFile as any).id.should.not.be.undefined;
        (newFile as any).id.should.not.be.null;
        (newFile as any).path.should.not.be.undefined;
        (newFile as any).path.should.not.be.null;

        const _fileId = (newFile as any).id;

        // post content of 1kb
        const buffer = Buffer.alloc(1);
        const revision = await deviceConfigurationClient.PostFileRevision(_fileId, buffer);
        (revision as any).fileId.should.not.be.undefined;
        (revision as any).fileId.should.not.be.null;
        (revision as any).contentType.should.not.be.undefined;
        (revision as any).contentType.should.not.be.null;

        // Get file revision
        const rRevision = await deviceConfigurationClient.GetFileRevisionMetadata(_fileId, (revision as any).hash);
        (rRevision as any).fileId.should.not.be.undefined;
        (rRevision as any).fileId.should.not.be.null;
        (rRevision as any).fileId.should.be.equal((revision as any).fileId);
        (rRevision as any).contentType.should.not.be.undefined;
        (rRevision as any).contentType.should.not.be.null;
        (rRevision as any).contentType.should.be.equal((revision as any).contentType);
        (rRevision as any).hash.should.not.be.undefined;
        (rRevision as any).hash.should.not.be.null;
        (rRevision as any).hash.should.be.equal((revision as any).hash);

        // delete file
        await deviceConfigurationClient.DeleteFile((newFile as any).id);
    });

    it("should GET file revision content.", async () => {
        deviceConfigurationClient.should.not.be.undefined;

        // Prepare the template
        const _configFileTemplate = {
            path: `/${tenant}/TEST/${timeOffset}/TEST_DEVICE_CONFIGURATION_F.json`,
            description: `Configuration for test the API. generated by ${tenant} on ${new Date()}`,
        };

        const newFile = await deviceConfigurationClient.PostNewFile(_configFileTemplate);

        newFile.should.not.be.undefined;
        newFile.should.not.be.null;
        (newFile as any).id.should.not.be.undefined;
        (newFile as any).id.should.not.be.null;
        (newFile as any).path.should.not.be.undefined;
        (newFile as any).path.should.not.be.null;

        const _fileId = (newFile as any).id;

        // post content of 1kb
        const buffer = Buffer.alloc(1);
        const revision = await deviceConfigurationClient.PostFileRevision(_fileId, buffer);
        (revision as any).fileId.should.not.be.undefined;
        (revision as any).fileId.should.not.be.null;
        (revision as any).contentType.should.not.be.undefined;
        (revision as any).contentType.should.not.be.null;

        // Get file revision
        const rContent = await deviceConfigurationClient.GetFileRevisionContent(_fileId, (revision as any).hash);
        rContent.should.not.be.undefined;
        rContent.should.not.be.null;

        // delete file
        await deviceConfigurationClient.DeleteFile((newFile as any).id);
    });

    it("should DELETE a file of 1b.", async () => {
        deviceConfigurationClient.should.not.be.undefined;

        // Prepare the template
        const _configFileTemplate = {
            path: `/${tenant}/TEST/${timeOffset}/TEST_DEVICE_CONFIGURATION_G.json`,
            description: `Configuration for test the API. generated by ${tenant} on ${new Date()}`,
        };

        const newFile = await deviceConfigurationClient.PostNewFile(_configFileTemplate);

        newFile.should.not.be.undefined;
        newFile.should.not.be.null;
        (newFile as any).id.should.not.be.undefined;
        (newFile as any).id.should.not.be.null;
        (newFile as any).path.should.not.be.undefined;
        (newFile as any).path.should.not.be.null;

        const _fileId = (newFile as any).id;

        // post content of 1b
        const buffer = Buffer.alloc(1);
        const revision = await deviceConfigurationClient.PostFileRevision(_fileId, buffer);
        (revision as any).fileId.should.not.be.undefined;
        (revision as any).fileId.should.not.be.null;
        (revision as any).contentType.should.not.be.undefined;
        (revision as any).contentType.should.not.be.null;

        // delete file
        await deviceConfigurationClient.DeleteFile((newFile as any).id);
    });

    it("should POST a new configuration task", async () => {
        deviceConfigurationClient.should.not.be.undefined;

        // Change the testConfigurationTask
        testConfigurationTask.customData.name = `TEST_DEVICE_CONFIGURATION_${tenant}_${timeOffset}_A`;

        // Create a new app instance configuration
        const newConfigtask = await deviceConfigurationClient.PostNewDeploymentTaskConfiguration(
            deviceId,
            testConfigurationTask
        );

        newConfigtask.should.not.be.undefined;
        newConfigtask.should.not.be.null;
        (newConfigtask as any).id.should.not.be.undefined;
        (newConfigtask as any).id.should.not.be.null;
        (newConfigtask as any).customData.name.should.not.be.undefined;
        (newConfigtask as any).customData.name.should.not.be.null;
        (newConfigtask as any).currentState.should.not.be.undefined;
        (newConfigtask as any).currentState.should.not.be.null;
        configTaskId = `${(newConfigtask as any).id}`;
        //
        // const _configTaskId = `${(newConfigtask as any).id}`;
        //
        // // Cancel the task
        // testConfigurationState.state = DeviceConfigurationModels.Updatetask.StateEnum.CANCELED;
        // testConfigurationState.progress = 100;
        // const configtask = await deviceConfigurationClient.PatchDeploymentTaskConfiguration(
        //     deviceId,
        //     _configTaskId,
        //     testConfigurationState
        // );
    });

    it("should GET list all tasks of a device @sanity", async () => {
        deviceConfigurationClient.should.not.be.undefined;
        const apps = await deviceConfigurationClient.GetConfigurationTasks(deviceId);
        apps.should.not.be.undefined;
        apps.should.not.be.null;
        (apps as any).page.number.should.equal(0);
        (apps as any).page.size.should.be.gte(10);
        (apps as any).content.length.should.be.gte(0);
    });

    it("should GET status of a configuration task by id", async () => {
        deviceConfigurationClient.should.not.be.undefined;
        const status = await deviceConfigurationClient.GetDeviceConfigurationTask(deviceId, configTaskId);
        status.should.not.be.undefined;
        status.should.not.be.null;
        (status as any).currentState.should.not.be.undefined;
        (status as any).currentState.should.not.be.null;
    });

    it("should PATCH status of configuration task: cancel task.", async () => {
        // Patch the task
        // Prepare the state
        testConfigurationState.state = DeviceConfigurationModels.Updatetask.StateEnum.CANCELED;
        testConfigurationState.progress = 100;
        const configtask = await deviceConfigurationClient.PatchDeploymentTaskConfiguration(
            deviceId,
            configTaskId,
            testConfigurationState
        );

        (configtask as any).id.should.not.be.undefined;
        (configtask as any).id.should.not.be.null;
        (configtask as any).currentState.should.not.be.undefined;
        (configtask as any).currentState.should.not.be.null;
    });

    it("should GET status of a configuration task, which should be canceled", async () => {
        deviceConfigurationClient.should.not.be.undefined;
        const status = await deviceConfigurationClient.GetDeviceConfigurationTask(deviceId, configTaskId);
        status.should.not.be.undefined;
        status.should.not.be.null;
        (status as any).currentState.should.not.be.undefined;
        (status as any).currentState.should.not.be.null;
        (status as any).currentState.state.should.be.equal(
            DeviceConfigurationModels.ConfigurationStateInfo.StateEnum.CANCELED.toString()
        );
    });

    async function deleteFiles() {
        await sleep(2000);
        let files = null;
        let page = 0;
        do {
            files = (await deviceConfigurationClient.GetFiles(
                `/${tenant}/TEST`,
                100
            )) as DeviceConfigurationModels.PaginatedFileMetaData;
            files.content = files.content || [];
            files.page = files.page || { totalPages: 0 };

            for (const _fileMetaData of files.content || []) {
                const fileMetaData = _fileMetaData as DeviceConfigurationModels.FileMetaData;
                await deviceConfigurationClient.DeleteFile(`${fileMetaData.id}`);
            }
        } while (page++ < (files.page.totalPages || 0));
    }
});
