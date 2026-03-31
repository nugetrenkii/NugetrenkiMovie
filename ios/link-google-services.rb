require 'xcodeproj'
project_path = 'NugetrenkiMovie.xcodeproj'
project = Xcodeproj::Project.open(project_path)

file_path = 'NugetrenkiMovie/GoogleService-Info.plist'
group = project.main_group.find_subpath('NugetrenkiMovie', true)

# Remove existing reference if any to avoid duplicates
existing_ref = group.files.find { |f| f.path == 'GoogleService-Info.plist' }
if existing_ref
  existing_ref.remove_from_project
end

file_ref = group.new_reference('GoogleService-Info.plist')
target = project.targets.first
target.add_file_references([file_ref])
project.save
puts "Successfully added GoogleService-Info.plist to Xcode project!"
