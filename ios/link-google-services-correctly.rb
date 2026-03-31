require 'xcodeproj'
project_path = 'NugetrenkiMovie.xcodeproj'
project = Xcodeproj::Project.open(project_path)

file_path = 'NugetrenkiMovie/GoogleService-Info.plist'
group = project.main_group.find_subpath('NugetrenkiMovie', true)

# Remove ALL existing references to avoid duplicates or wrong paths
project.main_group.recursive_children.each do |child|
  if child.respond_to?(:path) && child.name == 'GoogleService-Info.plist'
    child.remove_from_project
  end
end


file_ref = group.new_reference(file_path)
target = project.targets.first
target.add_file_references([file_ref])
project.save
puts "Successfully added GoogleService-Info.plist to Xcode project securely!"
