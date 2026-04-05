/*         INFINITY CODE         */
/*   https://infinity-code.com   */

using System;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace InfinityCode.RealWorldTerrain.Windows
{
    public class RealWorldTerrainWaterMaskConverter : EditorWindow
    {
        private string inputFile;
        private int width;
        private int height;
        private int depth;
        private int threshold = 128;

        private void Convert()
        {
            if (!Validate()) return;

            string outputFile = EditorUtility.SaveFilePanel("Save Water Mask", "", "WaterMask.bytes", "bytes");
            if (string.IsNullOrEmpty(outputFile)) return;

            FileStream stream = File.OpenRead(inputFile);
            BinaryReader reader = new BinaryReader(stream);
            int bufferSize = 8192 * depth;
            byte[] buffer = new byte[bufferSize];
            byte[] output = new byte[Mathf.CeilToInt(width * height / 8f) + 8];
            
            MemoryStream ms = new MemoryStream(output);
            BinaryWriter writer = new BinaryWriter(ms);
            writer.Write(width);
            writer.Write(height);
            writer.Close();
            
            long outputIndex = 64;
            int bufferIndex = 0;
            int bufferCount = 0;
            int value = 0;

            while ((bufferCount = reader.Read(buffer, bufferIndex, bufferSize)) > 0)
            {
                for (int i = 0; i < bufferCount; i++)
                {
                    if (i % depth != depth - 1)
                    {
                        value += buffer[i];
                        continue;
                    }

                    value /= depth;
                    
                    int bitIndex = (int)(outputIndex % 8);
                    int bit = value > threshold ? 1 : 0;
                    byte o = (byte)(output[outputIndex / 8] | (bit << bitIndex));
                    output[outputIndex / 8] = o;
                    outputIndex++;
                }
            }
            
            reader.Close();
            stream.Close();
            
            File.WriteAllBytes(outputFile, output);
            AssetDatabase.Refresh();
            
            EditorUtility.DisplayDialog("Success", "Water mask successfully saved.", "OK");
        }

        private void OnGUI()
        {
            EditorGUILayout.HelpBox("Tool to convert RAW files to bitmask for water generation.", MessageType.Info);
            
            EditorGUILayout.BeginHorizontal();
            inputFile = EditorGUILayout.TextField("Input File", inputFile);
            if (GUILayout.Button("...", GUILayout.ExpandWidth(false)))
            {
                inputFile = EditorUtility.OpenFilePanel("Select Input File", inputFile, "raw");
            }

            EditorGUILayout.EndHorizontal();

            width = EditorGUILayout.IntField("Width", width);
            height = EditorGUILayout.IntField("Height", height);
            depth = EditorGUILayout.IntField("Depth", depth);
            threshold = EditorGUILayout.IntField("Threshold", threshold);

            if (GUILayout.Button("Convert"))
            {
                Convert();
            }
        }

        public static void OpenWindow()
        {
            GetWindow<RealWorldTerrainWaterMaskConverter>(true, "Raw to Water Mask Converter", true);
        }

        private bool Validate()
        {
            if (string.IsNullOrEmpty(inputFile))
            {
                EditorUtility.DisplayDialog("Error", "Input file is empty.", "OK");
                return false;
            }

            if (!File.Exists(inputFile))
            {
                EditorUtility.DisplayDialog("Error", "Input file does not exist.", "OK");
                return false;
            }

            if (width <= 0 || height <= 0 || depth <= 0)
            {
                EditorUtility.DisplayDialog("Error", "Width, height and depth must be greater than zero.", "OK");
                return false;
            }
            
            FileInfo info = new FileInfo(inputFile);
            if (info.Length != width * height * depth)
            {
                EditorUtility.DisplayDialog("Error", "File size does not match the specified width, height and depth.", "OK");
                return false;
            }

            return true;
        }
    }
}