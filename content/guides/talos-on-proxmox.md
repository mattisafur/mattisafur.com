+++
title = "Deploying a Talos linux Kubernetes cluster on linux"
date = "2025-03-20"
+++

This article will guide you through the deployment of a Talos linux cluater on Proxmox.

Talos linux is a secure immutable and minimal linux distribution designed for Kubernetes. It include the bare minimum required to run Kubernetes.

## 1. Download the talos boot image

Go to [the talos image factory](https://factory.talos.dev) and follow the process of creating a talos linux image. Note that outside of a download link to the boot image, we are given an image schematic ID.

Two images can be used for deploying on proxmox, a bare-metal image, or the "NoCloud" Cloud server image.

While talos linux provide imagaes with secure boot capabilities, settings up secure boot is out of the scope of this guide.

During the image creation process, you can select system extentions to be availale during the nodes' setup process. Note that these extensions will only be available durig the setup process when the VM is booted from the instalation ISO, system extension for the regular operation of the node will be configured during in a later step using an image schematic ID.

ALthough not required, I would recommend adding the `siderolabs/qemu-guest-agent` system extension to both the setup image and later when setting up the the image to be used in normat operation.

## 2. Create the node VMs

Create the virtual machines which we will deploy the talos nodes on. For a single server proxmox cluster, I would recommend creating a one VM to act as a control plane and another one which will be out worker node. When deploying to a Proxmox cluster containing multiple servers, I would recommend creating more control planes and worker nodes to allow for configuring high availability.

When creating the virtual machine, follow the resource requirements from the [talos linux documentation](https://www.talos.dev/latest/introduction/system-requirements/).

At this point we can start up the VMs to continue to the next steps.

## 3. Generate the cluster config files.

Using the `talosctl` comamnd on a local machine with access to our cluster, we will generate the configuration files which we will apply to the nodes in order to configure them.

In order to install the `talosctl` CLI tool, follow the [official installation guide](https://www.talos.dev/latest/talos-guides/install/talosctl/).

in order to generate the configuration files we will run the following command setting the new name for our cluster and using the IP address of the node we want to be the control node:

```sh
talosctl gen config mycluster https://10.0.0.2:6443
```

running this command generate three files in out working directory:

- controlplane.yaml - contains the configuration for control plane nodes
- worker.yaml - contains the configuration for the worker nodes
- talosconfig - a configuration file which we will use on our client to access and authenticate to the cluster

Keep these files in a safe location as you might need to use them later

## 4. Set the image schematic for the nodes

In order to configure the system extensiosn we want running on our nodes during operation, we will need to edit the value `machine.install.image` and set it to the image ID which we will use for the nodes. Like when downloadin the boot image, image schematic ID can be egnerated on [the talos image factory](https://factory.talos.dev).

for example:

```yaml
machine:
  install:
    image: factory.talos.dev/installer/ce4c980550dd2ab1b17bbf2b08801c7eb59418eafe8f279833297925d67c7515:v1.9.4
```

This will deploy an image schematic containing the `siderolabs/qemu-guest-agent` system extension with the talos version 1.9.4.

## 5. Apply the machine configurations to the cluster nodes

in roder to deploy the configuration files we generated, we will use the following command:

```sh
talosctl apply-config --insecure --nodes 10.0.0.2 --file controlplane.yaml # control plane node
talosctl apply-config --insecure --nodes 10.0.0.3 --file worker.yaml # worker node
```

where `1.0.0.2` and `1.0.0.3` are the IP addresses of the control planes VM(s) and the worker node VM(s) respectively.

This will apply our configuration files to the nodes and reboot them.

## 6. Bootsrap etcd

In order to start using the cluster, we need to bootstrap the cluster, configuring etcd. This process is only needed to be done once on one control plane.

bootstrap the cluster using the command:

```sh
talosctl apply-config --talosconfig=./talosconfig --insecure --nodes 10.0.0.2 --endpoints 10.0.0.2
```

where both the IP address for the node and the endpoint are of the control plane.

## 7. (optional) generate a kubeconfig file

in order to generate the kubeconfig for the cluster, use the following command:

```sh
talosctl kubeconfig --talosconfig=talosconfig --nodes 10.0.0.2 --endpoints 10.0.0.2
```

where both the IP address for the node and the endpoint are of the control plane.
