#!/bin/bash

echo "Testing System Stats Commands:"
echo "================================"
echo ""

echo "OS Name:"
uname -s
echo ""

echo "Kernel Version:"
uname -r
echo ""

echo "Architecture:"
uname -m
echo ""

echo "Hostname:"
hostname
echo ""

echo "Boot Time:"
sysctl -n kern.boottime 2>/dev/null || echo "Not available (may need different command on Linux)"
echo ""

echo "CPU Brand:"
sysctl -n machdep.cpu.brand_string 2>/dev/null || echo "Not available (try: cat /proc/cpuinfo | grep 'model name' | head -1 on Linux)"
echo ""

echo "CPU Cores:"
sysctl -n hw.ncpu 2>/dev/null || nproc 2>/dev/null || echo "Not available"
echo ""

echo "Memory (bytes):"
sysctl -n hw.memsize 2>/dev/null || echo "Not available (try: free -b on Linux)"
echo ""

echo "Shell:"
echo $SHELL
echo ""

echo "Current User:"
whoami
echo ""
